import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimalsService } from '../animals/animals.service';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import { MedicinesService } from '../medicines/medicines.service';
import { UserEntity } from '../users/entities/user.entity';
import { CreateMedicineApplicationDto } from './dto/create-medicine-application.dto';
import { MedicineApplicationEntity } from './entities/medicine-application.entity';

@Injectable()
export class MedicineApplicationsService {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly medicinesService: MedicinesService,
    private readonly googleCalendarService: GoogleCalendarService,
    @InjectRepository(MedicineApplicationEntity)
    private readonly repository: Repository<MedicineApplicationEntity>,
  ) {}

  async create(user: UserEntity, dto: CreateMedicineApplicationDto) {
    const AnimalExists = await this.animalsService.findOne(dto.animalUuid);
    if (!AnimalExists) throw new NotFoundException('Animal does not exist');

    const MedicineExists = await this.medicinesService.findOne(dto.medicineUuid);
    if (!MedicineExists) throw new NotFoundException('Medicine does not exist');

    const medicineApplication = this.repository.create({
      ...dto,
      user,
      animal: AnimalExists,
      medicine: MedicineExists,
    });
    const savedMedicineApplication = await this.repository.save(medicineApplication);

    if (dto.nextApplicationAt) {
      const event = await this.googleCalendarService.createEvent({
        summary: `Aplicar ${MedicineExists.name} no ${AnimalExists.name}`,
        start: dto.nextApplicationAt,
        end: dto.endsAt,
        frequency: dto.frequency,
      });

      savedMedicineApplication.googleCalendarEventId = event.id ?? null;
      await this.repository.save(savedMedicineApplication);
    }

    return savedMedicineApplication;
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(uuid: string) {
    const medicineApplicationExists = await this.repository.findOneBy({ uuid });
    if (!medicineApplicationExists) throw new NotFoundException('Medicine application does not exist');

    return medicineApplicationExists;
  }

  async remove(uuid: string) {
    const medicineApplicationExists = await this.repository.findOneBy({ uuid });
    if (!medicineApplicationExists) throw new NotFoundException('Medicine application does not exist');

    if (medicineApplicationExists.googleCalendarEventId) {
      await this.googleCalendarService.deleteEvent(medicineApplicationExists.googleCalendarEventId);
    }

    await this.repository.remove(medicineApplicationExists);
  }
}
