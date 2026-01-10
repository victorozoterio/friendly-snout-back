import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MedicineBrandsService } from 'src/modules/medicine-brands/medicine-brands.service';
import { CreateMedicineDto } from 'src/modules/medicines/dto/create-medicine.dto';
import { UpdateMedicineDto } from 'src/modules/medicines/dto/update-medicine.dto';
import { MedicineEntity } from 'src/modules/medicines/entities/medicine.entity';
import { MedicinesService } from 'src/modules/medicines/medicines.service';
import { Repository } from 'typeorm';
import { mockMedicineBrandEntity, mockMedicineEntity } from '../../mocks';

describe('MedicinesService', () => {
  let medicinesService: MedicinesService;
  let medicineRepository: Repository<MedicineEntity>;
  let medicineBrandsService: MedicineBrandsService;

  const mockMedicineRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockMedicineBrandsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicinesService,
        {
          provide: getRepositoryToken(MedicineEntity),
          useValue: mockMedicineRepository,
        },
        {
          provide: MedicineBrandsService,
          useValue: mockMedicineBrandsService,
        },
      ],
    }).compile();

    medicinesService = module.get<MedicinesService>(MedicinesService);
    medicineRepository = module.get<Repository<MedicineEntity>>(getRepositoryToken(MedicineEntity));
    medicineBrandsService = module.get<MedicineBrandsService>(MedicineBrandsService);
  });

  it('should be defined', () => {
    expect(medicinesService).toBeDefined();
    expect(medicineRepository).toBeDefined();
    expect(medicineBrandsService).toBeDefined();
  });

  describe('create', () => {
    it('should create medicine with provided quantity', async () => {
      const dto: CreateMedicineDto = {
        name: 'dorflex',
        description: 'semelhante ao original',
        quantity: 5,
        medicineBrandUuid: 'brand-uuid-123',
      };

      const mockMedicineBrand = mockMedicineBrandEntity();
      const mockMedicine = mockMedicineEntity();

      mockMedicineBrandsService.findOne.mockResolvedValueOnce(mockMedicineBrand);
      mockMedicineRepository.findOne.mockResolvedValueOnce(null);
      mockMedicineRepository.create.mockReturnValueOnce({
        ...mockMedicine,
        quantity: 5,
      });
      mockMedicineRepository.save.mockResolvedValueOnce({
        ...mockMedicine,
        quantity: 5,
      });

      const result = await medicinesService.create(dto);

      expect(mockMedicineBrandsService.findOne).toHaveBeenCalledWith(dto.medicineBrandUuid);
      expect(mockMedicineRepository.findOne).toHaveBeenCalledWith({
        where: { name: dto.name, medicineBrand: { uuid: dto.medicineBrandUuid } },
      });
      expect(mockMedicineRepository.create).toHaveBeenCalledWith({
        ...dto,
        quantity: 5,
        medicineBrand: mockMedicineBrand,
      });
      expect(mockMedicineRepository.save).toHaveBeenCalled();
      expect(result.quantity).toBe(5);
    });

    it('should create medicine with quantity -1 when not provided', async () => {
      const dto: CreateMedicineDto = {
        name: 'dorflex',
        description: 'semelhante ao original',
        medicineBrandUuid: 'brand-uuid-123',
      };

      const mockMedicineBrand = mockMedicineBrandEntity();
      const mockMedicine = mockMedicineEntity();

      mockMedicineBrandsService.findOne.mockResolvedValueOnce(mockMedicineBrand);
      mockMedicineRepository.findOne.mockResolvedValueOnce(null);
      mockMedicineRepository.create.mockReturnValueOnce({
        ...mockMedicine,
        quantity: -1,
      });
      mockMedicineRepository.save.mockResolvedValueOnce({
        ...mockMedicine,
        quantity: -1,
      });

      const result = await medicinesService.create(dto);

      expect(mockMedicineRepository.create).toHaveBeenCalledWith({
        ...dto,
        quantity: -1,
        medicineBrand: mockMedicineBrand,
      });
      expect(result.quantity).toBe(-1);
    });

    it('should throw ConflictException if medicine already exists', async () => {
      const dto: CreateMedicineDto = {
        name: 'dorflex',
        description: 'semelhante ao original',
        quantity: 1,
        medicineBrandUuid: 'brand-uuid-123',
      };

      const mockMedicineBrand = mockMedicineBrandEntity();
      const mockMedicine = mockMedicineEntity();

      mockMedicineBrandsService.findOne.mockResolvedValueOnce(mockMedicineBrand);
      mockMedicineRepository.findOne.mockResolvedValueOnce(mockMedicine);

      await expect(medicinesService.create(dto)).rejects.toThrow(new ConflictException('Medicine already exists'));

      expect(mockMedicineBrandsService.findOne).toHaveBeenCalledWith(dto.medicineBrandUuid);
      expect(mockMedicineRepository.findOne).toHaveBeenCalledWith({
        where: { name: dto.name, medicineBrand: { uuid: dto.medicineBrandUuid } },
      });
    });
  });

  describe('findAll', () => {
    it('should return all medicines with relations', async () => {
      const mockMedicine = mockMedicineEntity();
      const medicines: MedicineEntity[] = [mockMedicine, mockMedicineEntity({ uuid: 'medicine-uuid-456' })];

      mockMedicineRepository.find.mockResolvedValueOnce(medicines);

      const result = await medicinesService.findAll();

      expect(mockMedicineRepository.find).toHaveBeenCalledWith({ relations: ['medicineBrand'] });
      expect(result).toBe(medicines);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if medicine does not exist', async () => {
      mockMedicineRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(medicinesService.findOne('123')).rejects.toThrow(new NotFoundException('Medicine does not exist'));

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should return medicine if exists', async () => {
      const mockMedicine = mockMedicineEntity();
      mockMedicineRepository.findOneBy.mockResolvedValueOnce(mockMedicine);

      const result = await medicinesService.findOne('123');

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(result).toEqual(mockMedicine);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if medicine does not exist', async () => {
      mockMedicineRepository.findOne.mockResolvedValueOnce(null);

      const dto: UpdateMedicineDto = {
        name: 'novo nome',
      };

      await expect(medicinesService.update('123', dto)).rejects.toThrow(
        new NotFoundException('Medicine does not exist'),
      );

      expect(mockMedicineRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: '123' },
        relations: ['medicineBrand'],
      });
    });

    it('should throw ConflictException if medicine with same name and brand already exists', async () => {
      const existingMedicine = mockMedicineEntity({ uuid: '123' });
      const dto: UpdateMedicineDto = {
        name: 'novo nome',
      };
      const conflictingMedicine = mockMedicineEntity({ uuid: '456', name: 'novo nome' });

      mockMedicineRepository.findOne.mockResolvedValueOnce(existingMedicine);
      mockMedicineRepository.findOne.mockResolvedValueOnce(conflictingMedicine);

      await expect(medicinesService.update('123', dto)).rejects.toThrow(
        new ConflictException('Medicine already exists'),
      );

      expect(mockMedicineRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: '123' },
        relations: ['medicineBrand'],
      });
      expect(mockMedicineRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'novo nome', medicineBrand: existingMedicine.medicineBrand },
        relations: ['medicineBrand'],
      });
    });

    it('should update medicine without changing brand', async () => {
      const existingMedicine = mockMedicineEntity({ uuid: '123' });
      const dto: UpdateMedicineDto = {
        name: 'novo nome',
        description: 'nova descrição',
      };

      mockMedicineRepository.findOne.mockResolvedValueOnce(existingMedicine).mockResolvedValueOnce(null);
      mockMedicineRepository.save.mockResolvedValueOnce({
        ...existingMedicine,
        ...dto,
      });

      const result = await medicinesService.update('123', dto);

      expect(mockMedicineRepository.merge).toHaveBeenCalledWith(existingMedicine, {
        ...dto,
        medicineBrand: existingMedicine.medicineBrand,
      });
      expect(mockMedicineRepository.save).toHaveBeenCalledWith(existingMedicine);
      expect(result).toEqual({ ...existingMedicine, ...dto });
    });

    it('should update medicine and change brand', async () => {
      const existingMedicine = mockMedicineEntity({ uuid: '123' });
      const newBrand = mockMedicineBrandEntity({ uuid: 'brand-uuid-456', name: 'Nova Marca' });
      const dto: UpdateMedicineDto = {
        name: 'novo nome',
        medicineBrandUuid: 'brand-uuid-456',
      };

      mockMedicineRepository.findOne.mockResolvedValueOnce(existingMedicine).mockResolvedValueOnce(null);
      mockMedicineBrandsService.findOne.mockResolvedValueOnce(newBrand);
      mockMedicineRepository.save.mockResolvedValueOnce({
        ...existingMedicine,
        name: 'novo nome',
        medicineBrand: newBrand,
      });

      const result = await medicinesService.update('123', dto);

      expect(mockMedicineBrandsService.findOne).toHaveBeenCalledWith('brand-uuid-456');
      expect(mockMedicineRepository.merge).toHaveBeenCalledWith(existingMedicine, {
        ...dto,
        medicineBrand: newBrand,
      });
      expect(result.medicineBrand).toBe(newBrand);
    });

    it('should not change brand if medicineBrandUuid is the same', async () => {
      const existingMedicine = mockMedicineEntity({ uuid: '123' });
      const dto: UpdateMedicineDto = {
        name: 'novo nome',
        medicineBrandUuid: existingMedicine.medicineBrand.uuid,
      };

      mockMedicineRepository.findOne.mockResolvedValueOnce(existingMedicine).mockResolvedValueOnce(null);
      mockMedicineRepository.save.mockResolvedValueOnce({
        ...existingMedicine,
        name: 'novo nome',
      });

      const result = await medicinesService.update('123', dto);

      expect(mockMedicineBrandsService.findOne).not.toHaveBeenCalled();
      expect(result.medicineBrand).toBe(existingMedicine.medicineBrand);
    });
  });

  describe('activate', () => {
    it('should throw NotFoundException if medicine does not exist', async () => {
      mockMedicineRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(medicinesService.activate('123')).rejects.toThrow(new NotFoundException('Medicine does not exist'));

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should activate medicine if it is inactive', async () => {
      const inactiveMedicine = mockMedicineEntity({ isActive: false });
      const activatedMedicine = { ...inactiveMedicine, isActive: true };

      mockMedicineRepository.findOneBy.mockResolvedValueOnce(inactiveMedicine);
      mockMedicineRepository.save.mockResolvedValueOnce(activatedMedicine);

      const result = await medicinesService.activate('123');

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMedicineRepository.save).toHaveBeenCalledWith(activatedMedicine);
      expect(result.isActive).toBe(true);
    });

    it('should return medicine without changes if already active', async () => {
      const activeMedicine = mockMedicineEntity({ isActive: true });

      mockMedicineRepository.findOneBy.mockResolvedValueOnce(activeMedicine);

      const result = await medicinesService.activate('123');

      expect(mockMedicineRepository.save).not.toHaveBeenCalled();
      expect(result.isActive).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should throw NotFoundException if medicine does not exist', async () => {
      mockMedicineRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(medicinesService.deactivate('123')).rejects.toThrow(
        new NotFoundException('Medicine does not exist'),
      );

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should deactivate medicine if it is active', async () => {
      const activeMedicine = mockMedicineEntity({ isActive: true });
      const deactivatedMedicine = { ...activeMedicine, isActive: false };

      mockMedicineRepository.findOneBy.mockResolvedValueOnce(activeMedicine);
      mockMedicineRepository.save.mockResolvedValueOnce(deactivatedMedicine);

      const result = await medicinesService.deactivate('123');

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMedicineRepository.save).toHaveBeenCalledWith(deactivatedMedicine);
      expect(result.isActive).toBe(false);
    });

    it('should return medicine without changes if already inactive', async () => {
      const inactiveMedicine = mockMedicineEntity({ isActive: false });

      mockMedicineRepository.findOneBy.mockResolvedValueOnce(inactiveMedicine);

      const result = await medicinesService.deactivate('123');

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMedicineRepository.save).not.toHaveBeenCalled();
      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if medicine does not exist', async () => {
      mockMedicineRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(medicinesService.remove('123')).rejects.toThrow(new NotFoundException('Medicine does not exist'));

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should remove medicine', async () => {
      const mockMedicine = mockMedicineEntity();
      mockMedicineRepository.findOneBy.mockResolvedValueOnce(mockMedicine);
      mockMedicineRepository.remove.mockResolvedValueOnce(mockMedicine);

      await medicinesService.remove('123');

      expect(mockMedicineRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMedicineRepository.remove).toHaveBeenCalledWith(mockMedicine);
    });
  });
});
