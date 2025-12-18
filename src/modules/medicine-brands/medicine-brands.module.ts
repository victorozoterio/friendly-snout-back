import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineBrandEntity } from './entities/medicine-brand.entity';
import { MedicineBrandsController } from './medicine-brands.controller';
import { MedicineBrandsService } from './medicine-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicineBrandEntity])],
  controllers: [MedicineBrandsController],
  providers: [MedicineBrandsService],
})
export class MedicineBrandsModule {}
