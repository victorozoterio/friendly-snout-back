import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { MedicineBrandEntity } from '../medicine-brands/entities/medicine-brand.entity';
import { MedicineBrandsService } from '../medicine-brands/medicine-brands.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineEntity } from './entities/medicine.entity';

@Injectable()
export class MedicinesService {
  constructor(
    private readonly medicineBrandsService: MedicineBrandsService,
    @InjectRepository(MedicineEntity)
    private readonly repository: Repository<MedicineEntity>,
  ) {}

  async create(dto: CreateMedicineDto) {
    const medicineBrand = await this.medicineBrandsService.findOne(dto.medicineBrandUuid);

    const medicineAlreadyExists = await this.repository.findOne({
      where: { name: dto.name, medicineBrand: { uuid: dto.medicineBrandUuid } },
    });
    if (medicineAlreadyExists) throw new ConflictException('Medicine already exists');

    const medicine = this.repository.create({ ...dto, medicineBrand: medicineBrand });
    return this.repository.save(medicine);
  }

  async findAll(query: PaginateQuery) {
    const config: PaginateConfig<MedicineEntity> = {
      sortableColumns: ['createdAt', 'name', 'quantity', 'isActive'],
      defaultSortBy: [['createdAt', 'DESC']],
      defaultLimit: 10,
      maxLimit: 100,
      searchableColumns: ['name'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
      },
    };

    return paginate(query, this.repository, config);
  }

  async findOne(uuid: string) {
    const medicineExists = await this.repository.findOne({ where: { uuid }, relations: ['medicineBrand'] });
    if (!medicineExists) throw new NotFoundException('Medicine does not exist');

    return medicineExists;
  }

  async update(uuid: string, dto: UpdateMedicineDto) {
    const medicineExists = await this.repository.findOne({ where: { uuid }, relations: ['medicineBrand'] });
    if (!medicineExists) throw new NotFoundException('Medicine does not exist');

    const name = dto.name ?? medicineExists.name;
    let medicineBrand: MedicineBrandEntity = medicineExists.medicineBrand;

    if (dto.medicineBrandUuid && dto.medicineBrandUuid !== medicineExists.medicineBrand.uuid) {
      medicineBrand = await this.medicineBrandsService.findOne(dto.medicineBrandUuid);
    }

    const medicineWithSameNameAndBrand = await this.repository.findOne({
      where: { name, medicineBrand },
      relations: ['medicineBrand'],
    });
    if (medicineWithSameNameAndBrand) throw new ConflictException('Medicine already exists');

    this.repository.merge(medicineExists, { ...dto, medicineBrand });
    return this.repository.save(medicineExists);
  }

  async activate(uuid: string) {
    const medicineExists = await this.repository.findOneBy({ uuid });
    if (!medicineExists) throw new NotFoundException('Medicine does not exist');

    if (!medicineExists.isActive) {
      medicineExists.isActive = true;
      await this.repository.save(medicineExists);
    }

    return medicineExists;
  }

  async deactivate(uuid: string) {
    const medicineExists = await this.repository.findOneBy({ uuid });
    if (!medicineExists) throw new NotFoundException('Medicine does not exist');

    if (medicineExists.isActive) {
      medicineExists.isActive = false;
      await this.repository.save(medicineExists);
    }

    return medicineExists;
  }

  async remove(uuid: string) {
    const medicineExists = await this.repository.findOneBy({ uuid });
    if (!medicineExists) throw new NotFoundException('Medicine does not exist');

    await this.repository.remove(medicineExists);
  }
}
