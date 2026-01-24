import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { AnimalEntity } from './entities/animal.entity';
import { AnimalSpecies, AnimalStatus } from './utils';

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

  async findAll(query: PaginateQuery) {
    const config: PaginateConfig<AnimalEntity> = {
      sortableColumns: ['createdAt', 'name', 'species', 'breed', 'size', 'castrated', 'fiv', 'felv', 'status'],
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

  async totalPerStage() {
    const rows = await this.repository
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('a.species', 'species')
      .addSelect('COUNT(*)', 'count')
      .where('a.status IN (:...statuses)', {
        statuses: [AnimalStatus.QUARANTINE, AnimalStatus.SHELTERED, AnimalStatus.ADOPTED],
      })
      .andWhere('a.species IN (:...species)', {
        species: [AnimalSpecies.DOG, AnimalSpecies.CAT],
      })
      .groupBy('a.status')
      .addGroupBy('a.species')
      .getRawMany();

    const get = (status: AnimalStatus, species: AnimalSpecies) =>
      Number(rows.find((r) => r.status === status && r.species === species)?.count ?? 0);

    const build = (status: AnimalStatus) => {
      const dogs = get(status, AnimalSpecies.DOG);
      const cats = get(status, AnimalSpecies.CAT);
      return { dogs, cats, total: dogs + cats };
    };

    return {
      quarantine: build(AnimalStatus.QUARANTINE),
      sheltered: build(AnimalStatus.SHELTERED),
      adopted: build(AnimalStatus.ADOPTED),
    };
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
