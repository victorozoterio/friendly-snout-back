import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMedicineBrandDto } from './dto/create-medicine-brand.dto';
import { UpdateMedicineBrandDto } from './dto/update-medicine-brand.dto';
import { MedicineBrandEntity } from './entities/medicine-brand.entity';

@Injectable()
export class MedicineBrandsService {
  constructor(
    @InjectRepository(MedicineBrandEntity)
    private readonly repository: Repository<MedicineBrandEntity>,
  ) {}

  async create(dto: CreateMedicineBrandDto) {
    const medicineBrandAlreadyExists = await this.repository.findOneBy({ name: dto.name });
    if (medicineBrandAlreadyExists) throw new ConflictException('Medicine brand already exists');

    const medicineBrand = this.repository.create(dto);
    return this.repository.save(medicineBrand);
  }

  async findAll() {
    return this.repository.find();
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

    await this.repository.remove(medicineBrandExists);
  }
}
