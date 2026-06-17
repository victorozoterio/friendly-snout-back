import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { googleCalendar } from 'src/lib';
import { AnimalsService } from 'src/modules/animals/animals.service';
import { MedicineApplicationEntity } from 'src/modules/medicine-applications/entities/medicine-application.entity';
import { MedicineApplicationsService } from 'src/modules/medicine-applications/medicine-applications.service';
import { MedicinesService } from 'src/modules/medicines/medicines.service';
import { Repository } from 'typeorm';
import {
  mockAnimalEntity,
  mockCreateMedicineApplicationDto,
  mockMedicineApplicationEntity,
  mockMedicineEntity,
  mockUserEntity,
} from '../../mocks';

jest.mock('src/lib', () => ({
  googleCalendar: {
    createEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

describe('MedicineApplicationsService', () => {
  let medicineApplicationsService: MedicineApplicationsService;
  let medicineApplicationRepository: Repository<MedicineApplicationEntity>;
  let animalsService: AnimalsService;
  let medicinesService: MedicinesService;
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    leftJoin: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    addSelect: jest.Mock;
    orderBy: jest.Mock;
    addOrderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    clone: jest.Mock;
    getCount: jest.Mock;
    getMany: jest.Mock;
  };

  const mockMedicineApplicationRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAnimalsService = {
    findOne: jest.fn(),
  };

  const mockMedicinesService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const createQueryBuilder = () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      getMany: jest.fn(),
    };

    return queryBuilder;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockMedicineApplicationRepository.createQueryBuilder.mockReturnValue(createQueryBuilder());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicineApplicationsService,
        {
          provide: getRepositoryToken(MedicineApplicationEntity),
          useValue: mockMedicineApplicationRepository,
        },
        {
          provide: AnimalsService,
          useValue: mockAnimalsService,
        },
        {
          provide: MedicinesService,
          useValue: mockMedicinesService,
        },
      ],
    }).compile();

    medicineApplicationsService = module.get<MedicineApplicationsService>(MedicineApplicationsService);
    medicineApplicationRepository = module.get<Repository<MedicineApplicationEntity>>(
      getRepositoryToken(MedicineApplicationEntity),
    );
    animalsService = module.get<AnimalsService>(AnimalsService);
    medicinesService = module.get<MedicinesService>(MedicinesService);
  });

  it('should be defined', () => {
    expect(medicineApplicationsService).toBeDefined();
    expect(medicineApplicationRepository).toBeDefined();
    expect(animalsService).toBeDefined();
    expect(medicinesService).toBeDefined();
  });

  describe('create', () => {
    it('should create medicine application without Google Calendar event', async () => {
      const animalUuid = 'animal-uuid-123';
      const dto = mockCreateMedicineApplicationDto({
        nextApplicationAt: undefined,
        frequency: undefined,
      });
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();
      const mockMedicine = mockMedicineEntity({ quantity: 10 });
      const mockMedicineApplication = mockMedicineApplicationEntity({
        nextApplicationAt: null,
        frequency: null,
        googleCalendarEventId: null,
      });

      mockAnimalsService.findOne.mockResolvedValueOnce(mockAnimal);
      mockMedicinesService.findOne.mockResolvedValueOnce(mockMedicine);
      mockMedicineApplicationRepository.create.mockReturnValueOnce(mockMedicineApplication);
      mockMedicineApplicationRepository.save.mockResolvedValueOnce(mockMedicineApplication);
      mockMedicineApplicationRepository.find.mockResolvedValueOnce([]);

      const result = await medicineApplicationsService.create(animalUuid, dto, mockUser);

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(animalUuid);
      expect(mockMedicinesService.findOne).toHaveBeenCalledWith(dto.medicineUuid);
      expect(mockMedicineApplicationRepository.create).toHaveBeenCalledWith({
        ...dto,
        user: mockUser,
        animal: mockAnimal,
        medicine: mockMedicine,
      });
      expect(mockMedicineApplicationRepository.save).toHaveBeenCalledTimes(1);
      expect(mockMedicinesService.update).toHaveBeenCalledWith(dto.medicineUuid, {
        quantity: mockMedicine.quantity - dto.quantity,
      });
      expect(googleCalendar.createEvent).not.toHaveBeenCalled();
      expect(result.googleCalendarEventId).toBeNull();
    });

    it('should create medicine application with Google Calendar event', async () => {
      const animalUuid = 'animal-uuid-123';
      const dto = mockCreateMedicineApplicationDto();
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();
      const mockMedicine = mockMedicineEntity({ quantity: 10 });
      const mockMedicineApplication = mockMedicineApplicationEntity();

      const googleCalendarEvent = {
        id: 'event-id-123',
        summary: 'Test Event',
      };

      mockAnimalsService.findOne.mockResolvedValueOnce(mockAnimal);
      mockMedicinesService.findOne.mockResolvedValueOnce(mockMedicine);
      mockMedicineApplicationRepository.create.mockReturnValueOnce(mockMedicineApplication);
      mockMedicineApplicationRepository.save.mockResolvedValueOnce(mockMedicineApplication).mockResolvedValueOnce({
        ...mockMedicineApplication,
        googleCalendarEventId: 'event-id-123',
      });
      mockMedicineApplicationRepository.find.mockResolvedValueOnce([]);
      (googleCalendar.createEvent as jest.Mock).mockResolvedValueOnce(googleCalendarEvent);

      const result = await medicineApplicationsService.create(animalUuid, dto, mockUser);

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(animalUuid);
      expect(mockMedicinesService.findOne).toHaveBeenCalledWith(dto.medicineUuid);
      expect(mockMedicineApplicationRepository.create).toHaveBeenCalledWith({
        ...dto,
        user: mockUser,
        animal: mockAnimal,
        medicine: mockMedicine,
      });
      expect(googleCalendar.createEvent).toHaveBeenCalledWith({
        summary: `Aplicar ${mockMedicine.name} no ${mockAnimal.name}`,
        start: dto.nextApplicationAt,
        frequency: dto.frequency,
      });
      expect(mockMedicineApplicationRepository.save).toHaveBeenCalledTimes(2);
      expect(mockMedicinesService.update).toHaveBeenCalledWith(dto.medicineUuid, {
        quantity: mockMedicine.quantity - dto.quantity,
      });
      expect(result.googleCalendarEventId).toBe('event-id-123');
    });

    it('should create medicine application with Google Calendar event that returns null id', async () => {
      const animalUuid = 'animal-uuid-123';
      const dto = mockCreateMedicineApplicationDto();
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();
      const mockMedicine = mockMedicineEntity({ quantity: 10 });
      const mockMedicineApplication = mockMedicineApplicationEntity();

      const googleCalendarEvent = {
        id: null,
        summary: 'Test Event',
      };

      mockAnimalsService.findOne.mockResolvedValueOnce(mockAnimal);
      mockMedicinesService.findOne.mockResolvedValueOnce(mockMedicine);
      mockMedicineApplicationRepository.create.mockReturnValueOnce(mockMedicineApplication);
      mockMedicineApplicationRepository.save.mockResolvedValueOnce(mockMedicineApplication).mockResolvedValueOnce({
        ...mockMedicineApplication,
        googleCalendarEventId: null,
      });
      mockMedicineApplicationRepository.find.mockResolvedValueOnce([]);
      (googleCalendar.createEvent as jest.Mock).mockResolvedValueOnce(googleCalendarEvent);

      const result = await medicineApplicationsService.create(animalUuid, dto, mockUser);

      expect(googleCalendar.createEvent).toHaveBeenCalled();
      expect(mockMedicineApplicationRepository.save).toHaveBeenCalledTimes(2);
      expect(mockMedicinesService.update).toHaveBeenCalledWith(dto.medicineUuid, {
        quantity: mockMedicine.quantity - dto.quantity,
      });
      expect(result.googleCalendarEventId).toBeNull();
    });

    it('should not decrement stock when medicine has infinite quantity (-1)', async () => {
      const animalUuid = 'animal-uuid-123';
      const dto = mockCreateMedicineApplicationDto({
        nextApplicationAt: undefined,
        frequency: undefined,
      });
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();
      const mockMedicine = mockMedicineEntity({ quantity: -1 });
      const mockMedicineApplication = mockMedicineApplicationEntity({
        nextApplicationAt: null,
        frequency: null,
        googleCalendarEventId: null,
      });

      mockAnimalsService.findOne.mockResolvedValueOnce(mockAnimal);
      mockMedicinesService.findOne.mockResolvedValueOnce(mockMedicine);
      mockMedicineApplicationRepository.create.mockReturnValueOnce(mockMedicineApplication);
      mockMedicineApplicationRepository.save.mockResolvedValueOnce(mockMedicineApplication);
      mockMedicineApplicationRepository.find.mockResolvedValueOnce([]);

      await medicineApplicationsService.create(animalUuid, dto, mockUser);

      expect(mockMedicinesService.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when medicine quantity is insufficient', async () => {
      const animalUuid = 'animal-uuid-123';
      const dto = mockCreateMedicineApplicationDto({
        quantity: 10,
        nextApplicationAt: undefined,
        frequency: undefined,
      });
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();
      const mockMedicine = mockMedicineEntity({ quantity: 5 });

      mockAnimalsService.findOne.mockResolvedValueOnce(mockAnimal);
      mockMedicinesService.findOne.mockResolvedValueOnce(mockMedicine);

      await expect(medicineApplicationsService.create(animalUuid, dto, mockUser)).rejects.toThrow(
        new BadRequestException('Insufficient medicine quantity'),
      );

      expect(mockMedicineApplicationRepository.create).not.toHaveBeenCalled();
      expect(mockMedicinesService.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if animal does not exist', async () => {
      const animalUuid = 'animal-uuid-123';
      const dto = mockCreateMedicineApplicationDto({
        nextApplicationAt: undefined,
        frequency: undefined,
      });
      const mockUser = mockUserEntity();

      mockAnimalsService.findOne.mockRejectedValueOnce(new NotFoundException('Animal does not exist'));

      await expect(medicineApplicationsService.create(animalUuid, dto, mockUser)).rejects.toThrow(
        new NotFoundException('Animal does not exist'),
      );

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(animalUuid);
      expect(mockMedicinesService.findOne).not.toHaveBeenCalled();
      expect(mockMedicineApplicationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if medicine does not exist', async () => {
      const animalUuid = 'animal-uuid-123';
      const dto = mockCreateMedicineApplicationDto({
        nextApplicationAt: undefined,
        frequency: undefined,
      });
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();

      mockAnimalsService.findOne.mockResolvedValueOnce(mockAnimal);
      mockMedicinesService.findOne.mockRejectedValueOnce(new NotFoundException('Medicine does not exist'));

      await expect(medicineApplicationsService.create(animalUuid, dto, mockUser)).rejects.toThrow(
        new NotFoundException('Medicine does not exist'),
      );

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(animalUuid);
      expect(mockMedicinesService.findOne).toHaveBeenCalledWith(dto.medicineUuid);
      expect(mockMedicineApplicationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByAnimal', () => {
    it('should return paginated medicine applications for an animal', async () => {
      const animalUuid = 'animal-uuid-123';
      const paginatedItems = [
        mockMedicineApplicationEntity(),
        mockMedicineApplicationEntity({ uuid: 'application-uuid-456' }),
      ];
      queryBuilder.getCount.mockResolvedValueOnce(2);
      queryBuilder.getMany.mockResolvedValueOnce(paginatedItems);

      const query = { page: '1', limit: '10', sortBy: 'createdAt:DESC' };
      const result = await medicineApplicationsService.findAllByAnimal(
        animalUuid,
        query as unknown as import('nestjs-paginate').PaginateQuery,
      );

      expect(mockMedicineApplicationRepository.createQueryBuilder).toHaveBeenCalledWith('medicineApplication');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('medicineApplication.medicine', 'medicine');
      expect(queryBuilder.leftJoin).toHaveBeenCalledWith('medicineApplication.animal', 'animal');
      expect(queryBuilder.where).toHaveBeenCalledWith('animal.uuid = :animalUuid', { animalUuid });
      expect(queryBuilder.addSelect).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('status_order', 'ASC');
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('medicineApplication.createdAt', 'DESC');
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('status');
      expect(result.meta).toMatchObject({
        itemsPerPage: 10,
        totalItems: 2,
        currentPage: 1,
        totalPages: 1,
      });
    });

    it('should sort only by medicine name when explicitly requested', async () => {
      const animalUuid = 'animal-uuid-123';
      queryBuilder.getCount.mockResolvedValueOnce(0);
      queryBuilder.getMany.mockResolvedValueOnce([]);

      await medicineApplicationsService.findAllByAnimal(animalUuid, {
        sortBy: [['medicine.name', 'ASC']],
      } as unknown as import('nestjs-paginate').PaginateQuery);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('medicine.name', 'ASC');
      expect(queryBuilder.addOrderBy).not.toHaveBeenCalledWith('medicineApplication.createdAt', 'DESC');
    });

    it('should sort by status when explicitly requested', async () => {
      const animalUuid = 'animal-uuid-123';
      queryBuilder.getCount.mockResolvedValueOnce(0);
      queryBuilder.getMany.mockResolvedValueOnce([]);

      await medicineApplicationsService.findAllByAnimal(animalUuid, {
        sortBy: [['status', 'DESC']],
      } as unknown as import('nestjs-paginate').PaginateQuery);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('status_order', 'DESC');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if medicine application does not exist', async () => {
      mockMedicineApplicationRepository.findOne.mockResolvedValueOnce(null);

      await expect(medicineApplicationsService.remove('123')).rejects.toThrow(
        new NotFoundException('Medicine application does not exist'),
      );

      expect(mockMedicineApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: '123' },
        relations: ['medicine'],
      });
      expect(googleCalendar.deleteEvent).not.toHaveBeenCalled();
      expect(mockMedicineApplicationRepository.remove).not.toHaveBeenCalled();
    });

    it('should remove medicine application without Google Calendar event', async () => {
      const medicineApplicationWithoutEvent = mockMedicineApplicationEntity({
        googleCalendarEventId: null,
      });

      const mockMedicine = mockMedicineEntity({ quantity: 10 });
      medicineApplicationWithoutEvent.medicine = mockMedicine;

      mockMedicineApplicationRepository.findOne.mockResolvedValueOnce(medicineApplicationWithoutEvent);
      mockMedicineApplicationRepository.remove.mockResolvedValueOnce(medicineApplicationWithoutEvent);

      await medicineApplicationsService.remove('123');

      expect(mockMedicineApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: '123' },
        relations: ['medicine'],
      });
      expect(googleCalendar.deleteEvent).not.toHaveBeenCalled();
      expect(mockMedicinesService.update).toHaveBeenCalledWith(mockMedicine.uuid, {
        quantity: mockMedicine.quantity + medicineApplicationWithoutEvent.quantity,
      });
      expect(mockMedicineApplicationRepository.remove).toHaveBeenCalledWith(medicineApplicationWithoutEvent);
    });

    it('should remove medicine application and delete Google Calendar event', async () => {
      const medicineApplicationWithEvent = mockMedicineApplicationEntity({
        googleCalendarEventId: 'event-id-123',
      });

      const mockMedicine = mockMedicineEntity({ quantity: 10 });
      medicineApplicationWithEvent.medicine = mockMedicine;

      mockMedicineApplicationRepository.findOne.mockResolvedValueOnce(medicineApplicationWithEvent);
      (googleCalendar.deleteEvent as jest.Mock).mockResolvedValueOnce(undefined);
      mockMedicineApplicationRepository.remove.mockResolvedValueOnce(medicineApplicationWithEvent);

      await medicineApplicationsService.remove('123');

      expect(mockMedicineApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: '123' },
        relations: ['medicine'],
      });
      expect(googleCalendar.deleteEvent).toHaveBeenCalledWith('event-id-123');
      expect(mockMedicinesService.update).toHaveBeenCalledWith(mockMedicine.uuid, {
        quantity: mockMedicine.quantity + medicineApplicationWithEvent.quantity,
      });
      expect(mockMedicineApplicationRepository.remove).toHaveBeenCalledWith(medicineApplicationWithEvent);
    });

    it('should not increment stock when medicine has infinite quantity (-1)', async () => {
      const medicineApplication = mockMedicineApplicationEntity({
        googleCalendarEventId: null,
      });
      const mockMedicine = mockMedicineEntity({ quantity: -1 });
      medicineApplication.medicine = mockMedicine;

      mockMedicineApplicationRepository.findOne.mockResolvedValueOnce(medicineApplication);
      mockMedicineApplicationRepository.remove.mockResolvedValueOnce(medicineApplication);

      await medicineApplicationsService.remove('123');

      expect(mockMedicinesService.update).not.toHaveBeenCalled();
    });
  });
});
