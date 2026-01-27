import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineEntity } from '../medicines/entities/medicine.entity';
import { MedicineBrandEntity } from './entities/medicine-brand.entity';
import { MedicineBrandsController } from './medicine-brands.controller';
import { MedicineBrandsService } from './medicine-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicineBrandEntity, MedicineEntity])],
  controllers: [MedicineBrandsController],
  providers: [MedicineBrandsService],
  exports: [MedicineBrandsService],
})
export class MedicineBrandsModule {}
