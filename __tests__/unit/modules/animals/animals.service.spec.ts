import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { paginate } from 'nestjs-paginate';
import { AnimalsService } from 'src/modules/animals/animals.service';
import { CreateAnimalDto } from 'src/modules/animals/dto/create-animal.dto';
import { UpdateAnimalDto } from 'src/modules/animals/dto/update-animal.dto';
import { AnimalEntity } from 'src/modules/animals/entities/animal.entity';
import { AnimalStatus } from 'src/modules/animals/utils';
import { Repository } from 'typeorm';

import { mockAnimalEntity, mockCreateAnimalDto } from '../../mocks';

jest.mock('nestjs-paginate', () => {
  const actual = jest.requireActual('nestjs-paginate');
  return {
    ...actual,
    paginate: jest.fn(),
  };
});

describe('AnimalsService', () => {
  let animalsService: AnimalsService;
  let animalRepository: Repository<AnimalEntity>;

  const mockAnimalRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnimalsService,
        {
          provide: getRepositoryToken(AnimalEntity),
          useValue: mockAnimalRepository,
        },
      ],
    }).compile();

    animalsService = module.get<AnimalsService>(AnimalsService);
    animalRepository = module.get<Repository<AnimalEntity>>(getRepositoryToken(AnimalEntity));
  });

  it('should be defined', () => {
    expect(animalsService).toBeDefined();
    expect(animalRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save animal', async () => {
      const dto: CreateAnimalDto = mockCreateAnimalDto();
      const animal = mockAnimalEntity();

      mockAnimalRepository.create.mockReturnValueOnce(animal);
      mockAnimalRepository.save.mockResolvedValueOnce(animal);

      const result = await animalsService.create(dto);

      expect(mockAnimalRepository.create).toHaveBeenCalledWith(dto);
      expect(mockAnimalRepository.save).toHaveBeenCalledWith(animal);
      expect(result).toBe(animal);
    });
  });

  describe('findAll', () => {
    it('should return paginated animals', async () => {
      const paginated = { data: [mockAnimalEntity(), mockAnimalEntity()] };
      (paginate as jest.Mock).mockResolvedValueOnce(paginated);

      const query = {};
      const result = await animalsService.findAll(query as unknown as import('nestjs-paginate').PaginateQuery);

      expect(paginate).toHaveBeenCalledWith(query, animalRepository, expect.any(Object));
      expect(result).toBe(paginated);
    });
  });

  describe('totalPerStage', () => {
    it('should return totals grouped by stage and species', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValueOnce([
          { status: AnimalStatus.QUARANTINE, species: 'cachorro', count: '2' },
          { status: AnimalStatus.QUARANTINE, species: 'gato', count: '1' },
          { status: AnimalStatus.SHELTERED, species: 'cachorro', count: '3' },
          { status: AnimalStatus.ADOPTED, species: 'gato', count: '4' },
        ]),
      };

      mockAnimalRepository.createQueryBuilder.mockReturnValueOnce(qb);

      const result = await animalsService.totalPerStage();

      expect(mockAnimalRepository.createQueryBuilder).toHaveBeenCalledWith('a');
      expect(qb.select).toHaveBeenCalledWith('a.status', 'status');
      expect(qb.addSelect).toHaveBeenCalledWith('a.species', 'species');
      expect(qb.addSelect).toHaveBeenCalledWith('COUNT(*)', 'count');
      expect(qb.groupBy).toHaveBeenCalledWith('a.status');
      expect(qb.addGroupBy).toHaveBeenCalledWith('a.species');

      expect(result).toEqual({
        quarantine: { dogs: 2, cats: 1, total: 3 },
        sheltered: { dogs: 3, cats: 0, total: 3 },
        adopted: { dogs: 0, cats: 4, total: 4 },
      });
    });

    it('should return zeros when query returns no rows', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValueOnce([]),
      };

      mockAnimalRepository.createQueryBuilder.mockReturnValueOnce(qb);

      const result = await animalsService.totalPerStage();

      expect(result).toEqual({
        quarantine: { dogs: 0, cats: 0, total: 0 },
        sheltered: { dogs: 0, cats: 0, total: 0 },
        adopted: { dogs: 0, cats: 0, total: 0 },
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if animal does not exist', async () => {
      mockAnimalRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(animalsService.findOne('123')).rejects.toThrow(new NotFoundException('Animal does not exist'));

      expect(mockAnimalRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should return animal if exists', async () => {
      const animal = mockAnimalEntity();

      mockAnimalRepository.findOneBy.mockResolvedValueOnce(animal);

      const result = await animalsService.findOne('123');

      expect(mockAnimalRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(result).toBe(animal);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if animal does not exist', async () => {
      mockAnimalRepository.findOneBy.mockResolvedValueOnce(null);

      const dto: UpdateAnimalDto = {
        notes: 'Animal passou por avaliação veterinária.',
        status: AnimalStatus.QUARANTINE,
      };

      await expect(animalsService.update('123', dto)).rejects.toThrow(new NotFoundException('Animal does not exist'));

      expect(mockAnimalRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should update and return animal', async () => {
      const animal = mockAnimalEntity();
      const dto: UpdateAnimalDto = {
        notes: 'Animal passou por avaliação veterinária.',
        status: AnimalStatus.QUARANTINE,
      };

      mockAnimalRepository.findOneBy.mockResolvedValueOnce(animal);
      mockAnimalRepository.save.mockResolvedValueOnce({ ...animal, ...dto });

      const result = await animalsService.update('123', dto);

      expect(mockAnimalRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockAnimalRepository.merge).toHaveBeenCalledWith(animal, dto);
      expect(mockAnimalRepository.save).toHaveBeenCalledWith(animal);
      expect(result).toEqual({ ...animal, ...dto });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if animal does not exist', async () => {
      mockAnimalRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(animalsService.remove('123')).rejects.toThrow(new NotFoundException('Animal does not exist'));

      expect(mockAnimalRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should remove animal', async () => {
      const animal = mockAnimalEntity();

      mockAnimalRepository.findOneBy.mockResolvedValueOnce(animal);
      mockAnimalRepository.remove.mockResolvedValueOnce(animal);

      await animalsService.remove('123');

      expect(mockAnimalRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockAnimalRepository.remove).toHaveBeenCalledWith(animal);
    });
  });
});
