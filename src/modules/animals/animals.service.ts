import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { cloudflare } from 'src/lib';
import { BreedEntity } from 'src/modules/species/entities/breed.entity';
import { SpeciesService } from 'src/modules/species/species.service';
import { Repository } from 'typeorm';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { AnimalEntity } from './entities/animal.entity';
import { AnimalStatus } from './utils';

@Injectable()
export class AnimalsService {
  constructor(
    private readonly speciesService: SpeciesService,
    @InjectRepository(AnimalEntity)
    private readonly repository: Repository<AnimalEntity>,
  ) {}

  async create(dto: CreateAnimalDto, file?: Express.Multer.File) {
    const { speciesUuid, breedUuid, ...animalDto } = dto;
    const species = await this.speciesService.findOne(speciesUuid);
    const breed = await this.findBreedForSpecies(breedUuid, speciesUuid);

    const createdAnimal = this.repository.create({
      ...animalDto,
      species: species,
      breed: breed,
      photoUrl: null,
    });
    const savedAnimal = await this.repository.save(createdAnimal);

    if (file) {
      const photoUrl = await cloudflare.uploadFile(`${savedAnimal.uuid}/profile-photo`, file);
      savedAnimal.photoUrl = photoUrl;
      await this.repository.save(savedAnimal);
    }

    return savedAnimal;
  }

  async findAll(query: PaginateQuery) {
    const config: PaginateConfig<AnimalEntity> = {
      sortableColumns: ['createdAt', 'name', 'species.name', 'breed.name', 'size', 'status'],
      defaultSortBy: [['createdAt', 'DESC']],
      defaultLimit: 10,
      maxLimit: 100,
      searchableColumns: ['name'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
      },
      relations: ['species', 'breed'],
    };

    return paginate(query, this.repository, config);
  }

  async totalPerStage() {
    const rows = await this.repository
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.status IN (:...statuses)', {
        statuses: [AnimalStatus.QUARANTINE, AnimalStatus.SHELTERED, AnimalStatus.ADOPTED, AnimalStatus.LOST],
      })
      .groupBy('a.status')
      .getRawMany();

    const get = (status: AnimalStatus) => Number(rows.find((r) => r.status === status)?.count ?? 0);

    return {
      quarantine: get(AnimalStatus.QUARANTINE),
      sheltered: get(AnimalStatus.SHELTERED),
      adopted: get(AnimalStatus.ADOPTED),
      lost: get(AnimalStatus.LOST),
    };
  }

  async findOne(uuid: string) {
    const animalExists = await this.repository.findOne({ where: { uuid }, relations: ['species', 'breed'] });
    if (!animalExists) throw new NotFoundException('Animal does not exist');

    return animalExists;
  }

  async update(uuid: string, dto: UpdateAnimalDto, file?: Express.Multer.File) {
    const animalExists = await this.repository.findOne({ where: { uuid }, relations: ['species', 'breed'] });
    if (!animalExists) throw new NotFoundException('Animal does not exist');

    const { speciesUuid, breedUuid, ...animalDto } = dto;

    if (speciesUuid || breedUuid) {
      const nextSpeciesUuid = speciesUuid ?? animalExists.species.uuid;
      const nextBreedUuid = breedUuid ?? animalExists.breed.uuid;
      const species = await this.speciesService.findOne(nextSpeciesUuid);
      const breed = await this.findBreedForSpecies(nextBreedUuid, nextSpeciesUuid);

      this.repository.merge(animalExists, {
        species: species,
        breed: breed,
      });
    }

    this.repository.merge(animalExists, animalDto);

    if (file) {
      if (animalExists.photoUrl) await cloudflare.deleteFile(animalExists.photoUrl);
      const photoUrl = await cloudflare.uploadFile(`${animalExists.uuid}/profile-photo`, file);
      animalExists.photoUrl = photoUrl;
    }

    return await this.repository.save(animalExists);
  }

  async remove(uuid: string) {
    const animalExists = await this.repository.findOneBy({ uuid });
    if (!animalExists) throw new NotFoundException('Animal does not exist');

    await this.repository.remove(animalExists);
  }

  private async findBreedForSpecies(breedUuid: string, speciesUuid: string): Promise<BreedEntity> {
    const breed = await this.speciesService.findBreed(breedUuid);
    if (breed.species.uuid !== speciesUuid) throw new BadRequestException('Breed does not belong to species');

    return breed;
  }
}
