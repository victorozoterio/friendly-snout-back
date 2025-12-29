import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateMedicineBrandDto } from 'src/modules/medicine-brands/dto/create-medicine-brand.dto';
import { UpdateMedicineBrandDto } from 'src/modules/medicine-brands/dto/update-medicine-brand.dto';
import { MedicineBrandEntity } from 'src/modules/medicine-brands/entities/medicine-brand.entity';
import { MedicineBrandsService } from 'src/modules/medicine-brands/medicine-brands.service';
import { Repository } from 'typeorm';

describe('MedicineBrandsService', () => {
  let medicineBrandsService: MedicineBrandsService;
  let medicineBrandRepository: Repository<MedicineBrandEntity>;

  const mockMedicineBrandRepository = {
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
        MedicineBrandsService,
        {
          provide: getRepositoryToken(MedicineBrandEntity),
          useValue: mockMedicineBrandRepository,
        },
      ],
    }).compile();

    medicineBrandsService = module.get<MedicineBrandsService>(MedicineBrandsService);
    medicineBrandRepository = module.get<Repository<MedicineBrandEntity>>(getRepositoryToken(MedicineBrandEntity));
  });

  it('should be defined', () => {
    expect(medicineBrandsService).toBeDefined();
    expect(medicineBrandRepository).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if medicine brand already exists', async () => {
      const dto: CreateMedicineBrandDto = { name: 'Vetnil' };
      const existingMedicineBrand: MedicineBrandEntity = {
        uuid: '123',
        name: 'Vetnil',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      };

      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(existingMedicineBrand);

      await expect(medicineBrandsService.create(dto)).rejects.toThrow(
        new ConflictException('Medicine brand already exists'),
      );

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ name: dto.name });
    });

    it('should create and save medicine brand', async () => {
      const dto: CreateMedicineBrandDto = { name: 'Vetnil' };
      const medicineBrand: MedicineBrandEntity = {
        uuid: '123',
        name: 'Vetnil',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      };

      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(null);
      mockMedicineBrandRepository.create.mockReturnValueOnce(medicineBrand);
      mockMedicineBrandRepository.save.mockResolvedValueOnce(medicineBrand);

      const result = await medicineBrandsService.create(dto);

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ name: dto.name });
      expect(mockMedicineBrandRepository.create).toHaveBeenCalledWith(dto);
      expect(mockMedicineBrandRepository.save).toHaveBeenCalledWith(medicineBrand);
      expect(result).toBe(medicineBrand);
    });
  });

  describe('findAll', () => {
    it('should return all medicine brands', async () => {
      const medicineBrands: MedicineBrandEntity[] = [
        {
          uuid: '123',
          name: 'Vetnil',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
        },
        {
          uuid: '456',
          name: 'Zoetis',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
        },
      ];

      mockMedicineBrandRepository.find.mockResolvedValueOnce(medicineBrands);

      const result = await medicineBrandsService.findAll();

      expect(mockMedicineBrandRepository.find).toHaveBeenCalled();
      expect(result).toBe(medicineBrands);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if medicine brand does not exist', async () => {
      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(medicineBrandsService.findOne('123')).rejects.toThrow(
        new NotFoundException('Medicine brand does not exist'),
      );

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should return medicine brand if exists', async () => {
      const medicineBrand: MedicineBrandEntity = {
        uuid: '123',
        name: 'Vetnil',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      };

      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(medicineBrand);

      const result = await medicineBrandsService.findOne('123');

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(result).toBe(medicineBrand);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if medicine brand does not exist', async () => {
      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(null);

      const dto: UpdateMedicineBrandDto = {
        name: 'Nova Marca',
      };

      await expect(medicineBrandsService.update('123', dto)).rejects.toThrow(
        new NotFoundException('Medicine brand does not exist'),
      );

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should throw ConflictException if new name already exists', async () => {
      const medicineBrand: MedicineBrandEntity = {
        uuid: '123',
        name: 'Vetnil',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      };
      const existingMedicineBrand: MedicineBrandEntity = {
        uuid: '456',
        name: 'Nova Marca',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      };
      const dto: UpdateMedicineBrandDto = {
        name: 'Nova Marca',
      };

      mockMedicineBrandRepository.findOneBy
        .mockResolvedValueOnce(medicineBrand)
        .mockResolvedValueOnce(existingMedicineBrand);

      await expect(medicineBrandsService.update('123', dto)).rejects.toThrow(
        new ConflictException('Medicine brand already exists'),
      );

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenNthCalledWith(1, { uuid: '123' });
      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenNthCalledWith(2, { name: dto.name });
    });

    it('should update and return medicine brand when name is not changed', async () => {
      const medicineBrand: MedicineBrandEntity = {
        uuid: '123',
        name: 'Vetnil',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      };
      const dto: UpdateMedicineBrandDto = {
        name: medicineBrand.name,
      };

      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(medicineBrand);
      mockMedicineBrandRepository.save.mockResolvedValueOnce({ ...medicineBrand, ...dto });

      const result = await medicineBrandsService.update('123', dto);

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMedicineBrandRepository.merge).toHaveBeenCalledWith(medicineBrand, dto);
      expect(mockMedicineBrandRepository.save).toHaveBeenCalledWith(medicineBrand);
      expect(result).toEqual({ ...medicineBrand, ...dto });
    });

    it('should update and return medicine brand when name is changed and does not exist', async () => {
      const medicineBrand: MedicineBrandEntity = {
        uuid: '123',
        name: 'Vetnil',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      };
      const dto: UpdateMedicineBrandDto = {
        name: 'Nova Marca',
      };

      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(medicineBrand).mockResolvedValueOnce(null);
      mockMedicineBrandRepository.save.mockResolvedValueOnce({ ...medicineBrand, ...dto });

      const result = await medicineBrandsService.update('123', dto);

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ name: dto.name });
      expect(mockMedicineBrandRepository.merge).toHaveBeenCalledWith(medicineBrand, dto);
      expect(mockMedicineBrandRepository.save).toHaveBeenCalledWith(medicineBrand);
      expect(result).toEqual({ ...medicineBrand, ...dto });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if medicine brand does not exist', async () => {
      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(medicineBrandsService.remove('123')).rejects.toThrow(
        new NotFoundException('Medicine brand does not exist'),
      );

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should remove medicine brand', async () => {
      const medicineBrand: MedicineBrandEntity = {
        uuid: '123',
        name: 'Vetnil',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      };

      mockMedicineBrandRepository.findOneBy.mockResolvedValueOnce(medicineBrand);
      mockMedicineBrandRepository.remove.mockResolvedValueOnce(medicineBrand);

      await medicineBrandsService.remove('123');

      expect(mockMedicineBrandRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMedicineBrandRepository.remove).toHaveBeenCalledWith(medicineBrand);
    });
  });
});
