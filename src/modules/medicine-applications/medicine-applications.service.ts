import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { googleCalendar } from 'src/lib';
import { Repository } from 'typeorm';
import { AnimalsService } from '../animals/animals.service';
import { MedicinesService } from '../medicines/medicines.service';
import { UserEntity } from '../users/entities/user.entity';
import { CreateMedicineApplicationDto } from './dto/create-medicine-application.dto';
import { MedicineApplicationEntity } from './entities/medicine-application.entity';

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

    const medicineApplication = this.repository.create({ ...dto, user, animal, medicine });
    const savedMedicineApplication = await this.repository.save(medicineApplication);

    if (dto.nextApplicationAt) {
      const event = await googleCalendar.createEvent({
        summary: `Aplicar ${medicine.name} no ${animal.name}`,
        start: dto.nextApplicationAt,
        end: dto.endsAt,
        frequency: dto.frequency,
      });

      savedMedicineApplication.googleCalendarEventId = event.id ?? null;
      await this.repository.save(savedMedicineApplication);
    }

    return savedMedicineApplication;
  }

  async findAllByAnimal(animalUuid: string, query: PaginateQuery) {
    const config: PaginateConfig<MedicineApplicationEntity> = {
      sortableColumns: ['createdAt', 'medicine', 'quantity', 'frequency', 'appliedAt', 'endsAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      defaultLimit: 10,
      maxLimit: 100,
      relations: ['medicine'],
      searchableColumns: ['medicine.name'],
      filterableColumns: {
        'medicine.name': [FilterOperator.ILIKE],
      },
    };

    return paginate(query, this.repository, { ...config, where: { animal: { uuid: animalUuid } } });
  }

  async remove(uuid: string) {
    const medicineApplicationExists = await this.repository.findOneBy({ uuid });
    if (!medicineApplicationExists) throw new NotFoundException('Medicine application does not exist');

    if (medicineApplicationExists.googleCalendarEventId) {
      await googleCalendar.deleteEvent(medicineApplicationExists.googleCalendarEventId);
    }

    await this.repository.remove(medicineApplicationExists);
  }
}
