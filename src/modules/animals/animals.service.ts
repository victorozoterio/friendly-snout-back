import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { AnimalEntity } from './entities/animal.entity';

@Injectable()
export class AnimalsService {
  constructor(
    @InjectRepository(AnimalEntity)
    private readonly repository: Repository<AnimalEntity>,
  ) {}

  async create(dto: CreateAnimalDto) {
    const createdAnimal = this.repository.create(dto);
    return this.repository.save(createdAnimal);
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(uuid: string) {
    const animalExists = await this.repository.findOneBy({ uuid });
    if (!animalExists) throw new NotFoundException('Animal does not exist');

    return animalExists;
  }

  async update(uuid: string, dto: UpdateAnimalDto) {
    const animalExists = await this.repository.findOneBy({ uuid });
    if (!animalExists) throw new NotFoundException('Animal does not exist');

    this.repository.merge(animalExists, dto);
    return this.repository.save(animalExists);
  }

  async remove(uuid: string) {
    const animalExists = await this.repository.findOneBy({ uuid });
    if (!animalExists) throw new NotFoundException('Animal does not exist');

    await this.repository.remove(animalExists);
  }
}
