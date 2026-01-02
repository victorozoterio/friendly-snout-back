import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalsModule } from '../animals/animals.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { MedicinesModule } from '../medicines/medicines.module';
import { MedicineApplicationEntity } from './entities/medicine-application.entity';
import { MedicineApplicationsController } from './medicine-applications.controller';
import { MedicineApplicationsService } from './medicine-applications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicineApplicationEntity]),
    AnimalsModule,
    MedicinesModule,
    GoogleCalendarModule,
  ],
  controllers: [MedicineApplicationsController],
  providers: [MedicineApplicationsService],
})
export class MedicineApplicationsModule {}
