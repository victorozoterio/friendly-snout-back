import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnimalsService } from 'src/modules/animals/animals.service';
import { GoogleCalendarService } from 'src/modules/google-calendar/google-calendar.service';
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

describe('MedicineApplicationsService', () => {
  let medicineApplicationsService: MedicineApplicationsService;
  let medicineApplicationRepository: Repository<MedicineApplicationEntity>;
  let animalsService: AnimalsService;
  let medicinesService: MedicinesService;
  let googleCalendarService: GoogleCalendarService;

  const mockMedicineApplicationRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockAnimalsService = {
    findOne: jest.fn(),
  };

  const mockMedicinesService = {
    findOne: jest.fn(),
  };

  const mockGoogleCalendarService = {
    createEvent: jest.fn(),
    deleteEvent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
        {
          provide: GoogleCalendarService,
          useValue: mockGoogleCalendarService,
        },
      ],
    }).compile();

    medicineApplicationsService = module.get<MedicineApplicationsService>(MedicineApplicationsService);
    medicineApplicationRepository = module.get<Repository<MedicineApplicationEntity>>(
      getRepositoryToken(MedicineApplicationEntity),
    );
    animalsService = module.get<AnimalsService>(AnimalsService);
    medicinesService = module.get<MedicinesService>(MedicinesService);
    googleCalendarService = module.get<GoogleCalendarService>(GoogleCalendarService);
  });

  it('should be defined', () => {
    expect(medicineApplicationsService).toBeDefined();
    expect(medicineApplicationRepository).toBeDefined();
    expect(animalsService).toBeDefined();
    expect(medicinesService).toBeDefined();
    expect(googleCalendarService).toBeDefined();
  });

  describe('create', () => {
    it('should create medicine application without Google Calendar event', async () => {
      const dto = mockCreateMedicineApplicationDto({
        nextApplicationAt: undefined,
        frequency: undefined,
        endsAt: undefined,
      });
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();
      const mockMedicine = mockMedicineEntity();
      const mockMedicineApplication = mockMedicineApplicationEntity({
        nextApplicationAt: null,
        frequency: null,
        endsAt: null,
        googleCalendarEventId: null,
      });

      mockAnimalsService.findOne.mockResolvedValueOnce(mockAnimal);
      mockMedicinesService.findOne.mockResolvedValueOnce(mockMedicine);
      mockMedicineApplicationRepository.create.mockReturnValueOnce(mockMedicineApplication);
      mockMedicineApplicationRepository.save.mockResolvedValueOnce(mockMedicineApplication);

      const result = await medicineApplicationsService.create(mockUser, dto);

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(dto.animalUuid);
      expect(mockMedicinesService.findOne).toHaveBeenCalledWith(dto.medicineUuid);
      expect(mockMedicineApplicationRepository.create).toHaveBeenCalledWith({
        ...dto,
        user: mockUser,
        animal: mockAnimal,
        medicine: mockMedicine,
      });
      expect(mockMedicineApplicationRepository.save).toHaveBeenCalledTimes(1);
      expect(mockGoogleCalendarService.createEvent).not.toHaveBeenCalled();
      expect(result.googleCalendarEventId).toBeNull();
    });

    it('should create medicine application with Google Calendar event', async () => {
      const dto = mockCreateMedicineApplicationDto();
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();
      const mockMedicine = mockMedicineEntity();
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
      mockGoogleCalendarService.createEvent.mockResolvedValueOnce(googleCalendarEvent);

      const result = await medicineApplicationsService.create(mockUser, dto);

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(dto.animalUuid);
      expect(mockMedicinesService.findOne).toHaveBeenCalledWith(dto.medicineUuid);
      expect(mockMedicineApplicationRepository.create).toHaveBeenCalledWith({
        ...dto,
        user: mockUser,
        animal: mockAnimal,
        medicine: mockMedicine,
      });
      expect(mockGoogleCalendarService.createEvent).toHaveBeenCalledWith({
        summary: `Aplicar ${mockMedicine.name} no ${mockAnimal.name}`,
        start: dto.nextApplicationAt,
        end: dto.endsAt,
        frequency: dto.frequency,
      });
      expect(mockMedicineApplicationRepository.save).toHaveBeenCalledTimes(2);
      expect(result.googleCalendarEventId).toBe('event-id-123');
    });

    it('should create medicine application with Google Calendar event that returns null id', async () => {
      const dto = mockCreateMedicineApplicationDto();
      const mockUser = mockUserEntity();
      const mockAnimal = mockAnimalEntity();
      const mockMedicine = mockMedicineEntity();
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
      mockGoogleCalendarService.createEvent.mockResolvedValueOnce(googleCalendarEvent);

      const result = await medicineApplicationsService.create(mockUser, dto);

      expect(mockGoogleCalendarService.createEvent).toHaveBeenCalled();
      expect(mockMedicineApplicationRepository.save).toHaveBeenCalledTimes(2);
      expect(result.googleCalendarEventId).toBeNull();
    });

    it('should throw NotFoundException if animal does not exist', async () => {
      const dto = mockCreateMedicineApplicationDto({
        nextApplicationAt: undefined,
        frequency: undefined,
        endsAt: undefined,
      });
      const mockUser = mockMedicineApplicationEntity().user;

      mockAnimalsService.findOne.mockRejectedValueOnce(new NotFoundException('Animal does not exist'));

      await expect(medicineApplicationsService.create(mockUser, dto)).rejects.toThrow(
        new NotFoundException('Animal does not exist'),
      );

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(dto.animalUuid);
      expect(mockMedicinesService.findOne).not.toHaveBeenCalled();
      expect(mockMedicineApplicationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if medicine does not exist', async () => {
      const dto = mockCreateMedicineApplicationDto({
        nextApplicationAt: undefined,
        frequency: undefined,
        endsAt: undefined,
      });
      const mockUser = mockMedicineApplicationEntity().user;
      const mockAnimal = mockMedicineApplicationEntity().animal;

      mockAnimalsService.findOne.mockResolvedValueOnce(mockAnimal);
      mockMedicinesService.findOne.mockRejectedValueOnce(new NotFoundException('Medicine does not exist'));

      await expect(medicineApplicationsService.create(mockUser, dto)).rejects.toThrow(
        new NotFoundException('Medicine does not exist'),
      );

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(dto.animalUuid);
      expect(mockMedicinesService.findOne).toHaveBeenCalledWith(dto.medicineUuid);
      expect(mockMedicineApplicationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all medicine applications', async () => {
      const medicineApplications: MedicineApplicationEntity[] = [
        mockMedicineApplicationEntity(),
        mockMedicineApplicationEntity({ uuid: 'application-uuid-456' }),
      ];

      mockMedicineApplicationRepository.find.mockResolvedValueOnce(medicineApplications);

      const result = await medicineApplicationsService.findAll();

      expect(mockMedicineApplicationRepository.find).toHaveBeenCalled();
      expect(result).toBe(medicineApplications);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if medicine application does not exist', async () => {
      mockMedicineApplicationRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(medicineApplicationsService.findOne('123')).rejects.toThrow(
        new NotFoundException('Medicine application does not exist'),
      );

      expect(mockMedicineApplicationRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should return medicine application if exists', async () => {
      const mockMedicineApplication = mockMedicineApplicationEntity();
      mockMedicineApplicationRepository.findOneBy.mockResolvedValueOnce(mockMedicineApplication);

      const result = await medicineApplicationsService.findOne('123');

      expect(mockMedicineApplicationRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(result).toBe(mockMedicineApplication);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if medicine application does not exist', async () => {
      mockMedicineApplicationRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(medicineApplicationsService.remove('123')).rejects.toThrow(
        new NotFoundException('Medicine application does not exist'),
      );

      expect(mockMedicineApplicationRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockGoogleCalendarService.deleteEvent).not.toHaveBeenCalled();
      expect(mockMedicineApplicationRepository.remove).not.toHaveBeenCalled();
    });

    it('should remove medicine application without Google Calendar event', async () => {
      const medicineApplicationWithoutEvent = mockMedicineApplicationEntity({
        googleCalendarEventId: null,
      });

      mockMedicineApplicationRepository.findOneBy.mockResolvedValueOnce(medicineApplicationWithoutEvent);
      mockMedicineApplicationRepository.remove.mockResolvedValueOnce(medicineApplicationWithoutEvent);

      await medicineApplicationsService.remove('123');

      expect(mockMedicineApplicationRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockGoogleCalendarService.deleteEvent).not.toHaveBeenCalled();
      expect(mockMedicineApplicationRepository.remove).toHaveBeenCalledWith(medicineApplicationWithoutEvent);
    });

    it('should remove medicine application and delete Google Calendar event', async () => {
      const medicineApplicationWithEvent = mockMedicineApplicationEntity({
        googleCalendarEventId: 'event-id-123',
      });

      mockMedicineApplicationRepository.findOneBy.mockResolvedValueOnce(medicineApplicationWithEvent);
      mockGoogleCalendarService.deleteEvent.mockResolvedValueOnce(undefined);
      mockMedicineApplicationRepository.remove.mockResolvedValueOnce(medicineApplicationWithEvent);

      await medicineApplicationsService.remove('123');

      expect(mockMedicineApplicationRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockGoogleCalendarService.deleteEvent).toHaveBeenCalledWith('event-id-123');
      expect(mockMedicineApplicationRepository.remove).toHaveBeenCalledWith(medicineApplicationWithEvent);
    });
  });
});
