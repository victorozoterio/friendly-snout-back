import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { MedicineEntity } from '../medicines/entities/medicine.entity';
import { CreateMedicineBrandDto } from './dto/create-medicine-brand.dto';
import { UpdateMedicineBrandDto } from './dto/update-medicine-brand.dto';
import { MedicineBrandEntity } from './entities/medicine-brand.entity';

@Injectable()
export class MedicineBrandsService {
  constructor(
    @InjectRepository(MedicineBrandEntity)
    private readonly repository: Repository<MedicineBrandEntity>,
    @InjectRepository(MedicineEntity)
    private readonly medicineRepository: Repository<MedicineEntity>,
  ) {}

  async create(dto: CreateMedicineBrandDto) {
    const medicineBrandAlreadyExists = await this.repository.findOneBy({ name: dto.name });
    if (medicineBrandAlreadyExists) throw new ConflictException('Medicine brand already exists');

    const medicineBrand = this.repository.create(dto);
    return this.repository.save(medicineBrand);
  }

  async findAll(query: PaginateQuery) {
    const config: PaginateConfig<MedicineBrandEntity> = {
      sortableColumns: ['createdAt', 'name'],
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
    const medicineBrandExists = await this.repository.findOneBy({ uuid });
    if (!medicineBrandExists) throw new NotFoundException('Medicine brand does not exist');

    return medicineBrandExists;
  }

  async update(uuid: string, dto: UpdateMedicineBrandDto) {
    const medicineBrandExists = await this.repository.findOneBy({ uuid });
    if (!medicineBrandExists) throw new NotFoundException('Medicine brand does not exist');

    if (medicineBrandExists.name !== dto.name) {
      const medicineBrandAlreadyExists = await this.repository.findOneBy({ name: dto.name });
      if (medicineBrandAlreadyExists) throw new ConflictException('Medicine brand already exists');
    }

    this.repository.merge(medicineBrandExists, dto);
    return this.repository.save(medicineBrandExists);
  }

  async remove(uuid: string) {
    const medicineBrandExists = await this.repository.findOneBy({ uuid });
    if (!medicineBrandExists) throw new NotFoundException('Medicine brand does not exist');

    const activeMedicinesWithThisBrand = await this.medicineRepository.count({
      where: { medicineBrand: { uuid }, isActive: true },
    });
    if (activeMedicinesWithThisBrand > 0) throw new ConflictException('Medicine brand has active medicines');

    await this.repository.remove(medicineBrandExists);
  }
}
