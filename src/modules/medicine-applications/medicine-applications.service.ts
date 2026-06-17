import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { googleCalendar } from 'src/lib';
import { IsNull, Not, Repository } from 'typeorm';
import { AnimalsService } from '../animals/animals.service';
import { MedicinesService } from '../medicines/medicines.service';
import { UserEntity } from '../users/entities/user.entity';
import { CreateMedicineApplicationDto } from './dto/create-medicine-application.dto';
import { MedicineApplicationEntity } from './entities/medicine-application.entity';
import { MedicineApplicationStatus } from './utils';

@Injectable()
export class MedicineApplicationsService {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly medicinesService: MedicinesService,
    @InjectRepository(MedicineApplicationEntity)
    private readonly repository: Repository<MedicineApplicationEntity>,
  ) {}

  async create(animalUuid: string, dto: CreateMedicineApplicationDto, user: UserEntity) {
    const animal = await this.animalsService.findOne(animalUuid);
    const medicine = await this.medicinesService.findOne(dto.medicineUuid);

    const medicineHasInfiniteQuantity = medicine.quantity === -1;
    const medicineHasEnoughQuantity = medicineHasInfiniteQuantity || dto.quantity <= medicine.quantity;

    if (!medicineHasEnoughQuantity) {
      throw new BadRequestException('Insufficient medicine quantity');
    }

    const medicineApplication = this.repository.create({
      ...dto,
      user,
      animal,
      medicine,
    });

    const savedMedicineApplication = await this.repository.save(medicineApplication);

    await this.markPreviousApplicationsAsApplied(animalUuid, medicine.uuid, savedMedicineApplication.uuid);

    if (!medicineHasInfiniteQuantity) {
      await this.medicinesService.update(dto.medicineUuid, {
        quantity: medicine.quantity - dto.quantity,
      });
    }

    if (dto.nextApplicationAt) {
      const event = await googleCalendar.createEvent({
        summary: `Aplicar ${medicine.name} no ${animal.name}`,
        start: dto.nextApplicationAt,
        frequency: dto.frequency,
      });

      savedMedicineApplication.googleCalendarEventId = event.id ?? null;
      await this.repository.save(savedMedicineApplication);
    }

    return {
      ...savedMedicineApplication,
      status: this.getStatus(savedMedicineApplication.nextApplicationAt),
    };
  }

  async findAllByAnimal(animalUuid: string, query: PaginateQuery) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const sortBy = this.getSortBy(query);
    const shouldUseDefaultOrder = sortBy[0][0] === 'createdAt' && sortBy[0][1] === 'DESC';
    const shouldUseStatusOrder = shouldUseDefaultOrder || sortBy[0][0] === 'status';
    const statusOrderExpression = this.getStatusOrderExpression();

    const queryBuilder = this.repository
      .createQueryBuilder('medicineApplication')
      .leftJoinAndSelect('medicineApplication.medicine', 'medicine')
      .leftJoin('medicineApplication.animal', 'animal')
      .where('animal.uuid = :animalUuid', { animalUuid });

    if (query.search) {
      queryBuilder.andWhere('medicine.name ILIKE :search', { search: `%${query.search}%` });
    }

    if (shouldUseStatusOrder) {
      queryBuilder.addSelect(statusOrderExpression, 'status_order');
    }

    if (shouldUseDefaultOrder) {
      queryBuilder.orderBy('status_order', 'ASC').addOrderBy('medicineApplication.createdAt', 'DESC');
    } else if (sortBy[0][0] === 'status') {
      queryBuilder.orderBy('status_order', sortBy[0][1]);
    } else {
      queryBuilder.orderBy(this.getOrderColumn(sortBy[0][0]), sortBy[0][1]);
    }

    const totalItems = await queryBuilder.clone().getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: data.map((medicineApplication) => ({
        ...medicineApplication,
        status: this.getStatus(medicineApplication.nextApplicationAt),
      })),
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        sortBy,
        search: query.search,
        filter: query.filter,
      },
      links: {},
    };
  }

  async remove(uuid: string) {
    const medicineApplicationExists = await this.repository.findOne({
      where: { uuid },
      relations: ['medicine'],
    });

    if (!medicineApplicationExists) {
      throw new NotFoundException('Medicine application does not exist');
    }

    if (medicineApplicationExists.googleCalendarEventId) {
      await googleCalendar.deleteEvent(medicineApplicationExists.googleCalendarEventId);
    }

    const medicine = medicineApplicationExists.medicine;
    const medicineHasInfiniteQuantity = medicine.quantity === -1;

    if (!medicineHasInfiniteQuantity) {
      await this.medicinesService.update(medicine.uuid, {
        quantity: medicine.quantity + medicineApplicationExists.quantity,
      });
    }

    await this.repository.remove(medicineApplicationExists);
  }

  private async markPreviousApplicationsAsApplied(
    animalUuid: string,
    medicineUuid: string,
    currentMedicineApplicationUuid: string,
  ) {
    const previousApplications = await this.repository.find({
      where: {
        uuid: Not(currentMedicineApplicationUuid),
        animal: { uuid: animalUuid },
        medicine: { uuid: medicineUuid },
        nextApplicationAt: Not(IsNull()),
      },
    });

    await Promise.all(
      previousApplications.map(async (medicineApplication) => {
        if (medicineApplication.googleCalendarEventId) {
          await googleCalendar.deleteEvent(medicineApplication.googleCalendarEventId);
        }

        medicineApplication.nextApplicationAt = null;
        medicineApplication.googleCalendarEventId = null;

        await this.repository.save(medicineApplication);
      }),
    );
  }

  private getStatus(nextApplicationAt: Date | string | null) {
    if (!nextApplicationAt) {
      return MedicineApplicationStatus.APPLIED;
    }

    const nextApplicationDate = new Date(nextApplicationAt);

    if (nextApplicationDate.getTime() < Date.now()) {
      return MedicineApplicationStatus.LATE;
    }

    return MedicineApplicationStatus.UP_TO_DATE;
  }

  private getSortBy(query: PaginateQuery): [[string, 'ASC' | 'DESC']] {
    const sortBy = query.sortBy?.[0];

    if (!sortBy) {
      return [['createdAt', 'DESC']];
    }

    const sortableColumns = [
      'createdAt',
      'medicine.name',
      'quantity',
      'frequency',
      'appliedAt',
      'nextApplicationAt',
      'status',
    ];

    const column = sortableColumns.includes(sortBy[0]) ? sortBy[0] : 'createdAt';
    const order = sortBy[1]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return [[column, order]];
  }

  private getOrderColumn(column: string) {
    const columns: Record<string, string> = {
      createdAt: 'medicineApplication.createdAt',
      'medicine.name': 'medicine.name',
      quantity: 'medicineApplication.quantity',
      frequency: 'medicineApplication.frequency',
      appliedAt: 'medicineApplication.appliedAt',
      nextApplicationAt: 'medicineApplication.nextApplicationAt',
    };

    return columns[column] ?? columns.createdAt;
  }

  private getStatusOrderExpression() {
    return `CASE
      WHEN "medicineApplication"."next_application_at" IS NOT NULL
        AND "medicineApplication"."next_application_at" < NOW()
      THEN 0
      WHEN "medicineApplication"."next_application_at" IS NULL
      THEN 1
      ELSE 2
    END`;
  }
}
