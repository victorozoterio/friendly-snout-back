import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalsModule } from '../animals/animals.module';
import { MedicinesModule } from '../medicines/medicines.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { MedicineApplicationEntity } from './entities/medicine-application.entity';
import { MedicineApplicationsController } from './medicine-applications.controller';
import { MedicineApplicationsService } from './medicine-applications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicineApplicationEntity]),
    AnimalsModule,
    MedicinesModule,
    PushNotificationsModule,
  ],
  controllers: [MedicineApplicationsController],
  providers: [MedicineApplicationsService],
})
export class MedicineApplicationsModule {}
