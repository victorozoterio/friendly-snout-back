import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineBrandEntity } from '../medicine-brands/entities/medicine-brand.entity';
import { MedicineBrandsService } from '../medicine-brands/medicine-brands.service';
import { MedicineEntity } from './entities/medicine.entity';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicineEntity, MedicineBrandEntity])],
  controllers: [MedicinesController],
  providers: [MedicinesService, MedicineBrandsService],
})
export class MedicinesModule {}
