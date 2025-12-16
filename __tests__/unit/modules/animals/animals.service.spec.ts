import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AnimalsService } from 'src/modules/animals/animals.service';
import { AnimalEntity } from 'src/modules/animals/entities/animal.entity';
import { CreateAnimalDto } from 'src/modules/animals/dto/create-animal.dto';
import { UpdateAnimalDto } from 'src/modules/animals/dto/update-animal.dto';

import { mockAnimalEntity, mockCreateAnimalDto } from '../../mocks';

describe('AnimalsService', () => {
  let animalsService: AnimalsService;
  let animalRepository: Repository<AnimalEntity>;

  const mockAnimalRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
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
    it('should return all animals', async () => {
      const animals = [mockAnimalEntity(), mockAnimalEntity()];

      mockAnimalRepository.find.mockResolvedValueOnce(animals);

      const result = await animalsService.findAll();

      expect(mockAnimalRepository.find).toHaveBeenCalled();
      expect(result).toBe(animals);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if animal does not exist', async () => {
      mockAnimalRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(animalsService.findOne('123')).rejects.toThrow(NotFoundException);
      await expect(animalsService.findOne('123')).rejects.toThrow('Animal does not exist');

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
      };

      await expect(animalsService.update('123', dto)).rejects.toThrow(NotFoundException);
      await expect(animalsService.update('123', dto)).rejects.toThrow('Animal does not exist');

      expect(mockAnimalRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should update and return animal', async () => {
      const animal = mockAnimalEntity();
      const dto: UpdateAnimalDto = {
        notes: 'Animal passou por avaliação veterinária.',
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

      await expect(animalsService.remove('123')).rejects.toThrow(NotFoundException);
      await expect(animalsService.remove('123')).rejects.toThrow('Animal does not exist');

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
