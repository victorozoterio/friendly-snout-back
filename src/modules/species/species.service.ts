import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { CreateBreedDto } from './dto/create-breed.dto';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { BreedEntity } from './entities/breed.entity';
import { SpeciesEntity } from './entities/species.entity';

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(SpeciesEntity)
    private readonly repository: Repository<SpeciesEntity>,
    @InjectRepository(BreedEntity)
    private readonly breedRepository: Repository<BreedEntity>,
  ) {}

  async create(dto: CreateSpeciesDto) {
    const speciesAlreadyExists = await this.repository.findOneBy({ name: dto.name });
    if (speciesAlreadyExists) throw new ConflictException('Species already exists');

    const species = this.repository.create(dto);
    return this.repository.save(species);
  }

  async findAll(query: PaginateQuery) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const sortBy = this.getSpeciesSortBy(query);

    const queryBuilder = this.repository.createQueryBuilder('species').leftJoinAndSelect('species.breeds', 'breeds');

    if (query.search) {
      queryBuilder.where('species.name ILIKE :search', { search: `%${query.search}%` });
    }

    const totalItems = await queryBuilder.clone().getCount();
    const orderColumn =
      sortBy[0][0] === 'breedsCount'
        ? '(SELECT COUNT(*) FROM breeds breed_count WHERE breed_count.species_uuid = species.uuid)'
        : `species.${sortBy[0][0]}`;

    const data = await queryBuilder
      .orderBy(orderColumn, sortBy[0][1])
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages,
        sortBy,
        search: query.search,
        filter: query.filter,
      },
      links: {},
    };
  }

  async findOne(uuid: string) {
    const speciesExists = await this.repository.findOne({ where: { uuid }, relations: ['breeds'] });
    if (!speciesExists) throw new NotFoundException('Species does not exist');

    return speciesExists;
  }

  async update(uuid: string, dto: UpdateSpeciesDto) {
    const speciesExists = await this.findOne(uuid);

    if (dto.name && speciesExists.name !== dto.name) {
      const speciesAlreadyExists = await this.repository.findOneBy({ name: dto.name });
      if (speciesAlreadyExists) throw new ConflictException('Species already exists');
    }

    this.repository.merge(speciesExists, dto);
    return this.repository.save(speciesExists);
  }

  async remove(uuid: string) {
    const speciesExists = await this.findOne(uuid);
    await this.repository.remove(speciesExists);
  }

  async createBreed(speciesUuid: string, dto: CreateBreedDto) {
    const species = await this.findOne(speciesUuid);
    const breedAlreadyExists = await this.breedRepository.findOne({
      where: { name: dto.name, species: { uuid: speciesUuid } },
    });
    if (breedAlreadyExists) throw new ConflictException('Breed already exists for this species');

    const breed = this.breedRepository.create({ ...dto, species });
    return this.breedRepository.save(breed);
  }

  async findBreeds(speciesUuid: string, query: PaginateQuery) {
    await this.findOne(speciesUuid);

    const config: PaginateConfig<BreedEntity> = {
      sortableColumns: ['createdAt', 'name'],
      defaultSortBy: [['createdAt', 'DESC']],
      defaultLimit: 10,
      maxLimit: 100,
      searchableColumns: ['name'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
      },
      where: { species: { uuid: speciesUuid } },
      relations: ['species'],
    };

    return paginate(query, this.breedRepository, config);
  }

  async findBreed(uuid: string) {
    const breedExists = await this.breedRepository.findOne({ where: { uuid }, relations: ['species'] });
    if (!breedExists) throw new NotFoundException('Breed does not exist');

    return breedExists;
  }

  async updateBreed(speciesUuid: string, uuid: string, dto: UpdateBreedDto) {
    const breedExists = await this.findBreed(uuid);
    if (breedExists.species.uuid !== speciesUuid) throw new NotFoundException('Breed does not exist for this species');

    if (dto.name && breedExists.name !== dto.name) {
      const breedAlreadyExists = await this.breedRepository.findOne({
        where: { name: dto.name, species: { uuid: speciesUuid } },
      });
      if (breedAlreadyExists) throw new ConflictException('Breed already exists for this species');
    }

    this.breedRepository.merge(breedExists, dto);
    return this.breedRepository.save(breedExists);
  }

  async removeBreed(speciesUuid: string, uuid: string) {
    const breedExists = await this.findBreed(uuid);
    if (breedExists.species.uuid !== speciesUuid) throw new NotFoundException('Breed does not exist for this species');

    await this.breedRepository.remove(breedExists);
  }

  private getSpeciesSortBy(query: PaginateQuery): [string, 'ASC' | 'DESC'][] {
    const allowedColumns = ['name', 'breedsCount', 'createdAt'];
    const [column = 'createdAt', direction = 'DESC'] = query.sortBy?.[0] ?? [];

    if (!allowedColumns.includes(column)) return [['createdAt', 'DESC']];

    return [[column, direction === 'ASC' ? 'ASC' : 'DESC']];
  }
}
