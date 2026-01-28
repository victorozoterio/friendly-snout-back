import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineApplicationEntity } from '../medicine-applications/entities/medicine-application.entity';
import { MedicineBrandsModule } from '../medicine-brands/medicine-brands.module';
import { MedicineEntity } from './entities/medicine.entity';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicineEntity, MedicineApplicationEntity]), MedicineBrandsModule],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [MedicinesService],
})
export class MedicinesModule {}
