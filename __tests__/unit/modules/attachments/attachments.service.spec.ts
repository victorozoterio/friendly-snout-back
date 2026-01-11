import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { cloudflare } from 'src/lib';
import { AnimalsService } from 'src/modules/animals/animals.service';
import { AttachmentsService } from 'src/modules/attachments/attachments.service';
import { AttachmentEntity } from 'src/modules/attachments/entities/attachment.entity';
import { Repository } from 'typeorm';
import { mockAnimalEntity, mockAttachmentEntity } from '../../mocks';

jest.mock('src/lib', () => ({
  cloudflare: {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  },
}));

describe('AttachmentsService', () => {
  let attachmentsService: AttachmentsService;
  let attachmentRepository: Repository<AttachmentEntity>;
  let animalsService: AnimalsService;

  const mockAttachmentRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockAnimalsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        {
          provide: getRepositoryToken(AttachmentEntity),
          useValue: mockAttachmentRepository,
        },
        {
          provide: AnimalsService,
          useValue: mockAnimalsService,
        },
      ],
    }).compile();

    attachmentsService = module.get<AttachmentsService>(AttachmentsService);
    attachmentRepository = module.get<Repository<AttachmentEntity>>(getRepositoryToken(AttachmentEntity));
    animalsService = module.get<AnimalsService>(AnimalsService);
  });

  it('should be defined', () => {
    expect(attachmentsService).toBeDefined();
    expect(attachmentRepository).toBeDefined();
    expect(animalsService).toBeDefined();
  });

  describe('create', () => {
    it('should create and save attachment', async () => {
      const animalUuid = 'animal-uuid-123';
      const animal = mockAnimalEntity({ uuid: animalUuid });
      const file: Express.Multer.File = {
        originalname: 'test-file.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        fieldname: 'file',
        encoding: '7bit',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
      };
      const fileUrl = 'https://example.com/animal-uuid-123/test-file.jpg';
      const attachment = mockAttachmentEntity({
        name: file.originalname,
        url: fileUrl,
        type: 'jpeg',
        animal,
      });

      mockAnimalsService.findOne.mockResolvedValueOnce(animal);
      mockAttachmentRepository.findOne.mockResolvedValueOnce(null);
      (cloudflare.uploadFile as jest.Mock).mockResolvedValueOnce(fileUrl);
      mockAttachmentRepository.create.mockReturnValueOnce(attachment);
      mockAttachmentRepository.save.mockResolvedValueOnce(attachment);

      const result = await attachmentsService.create(animalUuid, file);

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(animalUuid);
      expect(mockAttachmentRepository.findOne).toHaveBeenCalledWith({
        where: { name: file.originalname, animal: { uuid: animalUuid } },
      });
      expect(cloudflare.uploadFile).toHaveBeenCalledWith(animalUuid, file);
      expect(mockAttachmentRepository.create).toHaveBeenCalledWith({
        name: file.originalname,
        url: fileUrl,
        type: 'jpeg',
        animal,
      });
      expect(mockAttachmentRepository.save).toHaveBeenCalledWith(attachment);
      expect(result).toBe(attachment);
    });

    it('should throw ConflictException if attachment already exists', async () => {
      const animalUuid = 'animal-uuid-123';
      const animal = mockAnimalEntity({ uuid: animalUuid });
      const file: Express.Multer.File = {
        originalname: 'test-file.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        fieldname: 'file',
        encoding: '7bit',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
      };
      const existingAttachment = mockAttachmentEntity();

      mockAnimalsService.findOne.mockResolvedValueOnce(animal);
      mockAttachmentRepository.findOne.mockResolvedValueOnce(existingAttachment);

      await expect(attachmentsService.create(animalUuid, file)).rejects.toThrow(
        new ConflictException('Attachment already exists'),
      );

      expect(mockAnimalsService.findOne).toHaveBeenCalledWith(animalUuid);
      expect(mockAttachmentRepository.findOne).toHaveBeenCalledWith({
        where: { name: file.originalname, animal: { uuid: animalUuid } },
      });
      expect(cloudflare.uploadFile).not.toHaveBeenCalled();
      expect(mockAttachmentRepository.create).not.toHaveBeenCalled();
    });

    it('should extract file type from mimetype correctly', async () => {
      const animalUuid = 'animal-uuid-123';
      const animal = mockAnimalEntity({ uuid: animalUuid });
      const file: Express.Multer.File = {
        originalname: 'test-file.png',
        mimetype: 'image/png',
        buffer: Buffer.from('test'),
        fieldname: 'file',
        encoding: '7bit',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
      };
      const fileUrl = 'https://example.com/animal-uuid-123/test-file.png';
      const attachment = mockAttachmentEntity({
        name: file.originalname,
        url: fileUrl,
        type: 'png',
        animal,
      });

      mockAnimalsService.findOne.mockResolvedValueOnce(animal);
      mockAttachmentRepository.findOne.mockResolvedValueOnce(null);
      (cloudflare.uploadFile as jest.Mock).mockResolvedValueOnce(fileUrl);
      mockAttachmentRepository.create.mockReturnValueOnce(attachment);
      mockAttachmentRepository.save.mockResolvedValueOnce(attachment);

      const result = await attachmentsService.create(animalUuid, file);

      expect(mockAttachmentRepository.create).toHaveBeenCalledWith({
        name: file.originalname,
        url: fileUrl,
        type: 'png',
        animal,
      });
      expect(result.type).toBe('png');
    });
  });

  describe('findAllByAnimal', () => {
    it('should return all attachments for an animal', async () => {
      const animalUuid = 'animal-uuid-123';
      const attachments = [mockAttachmentEntity(), mockAttachmentEntity({ uuid: 'attachment-uuid-456' })];

      mockAttachmentRepository.find.mockResolvedValueOnce(attachments);

      const result = await attachmentsService.findAllByAnimal(animalUuid);

      expect(mockAttachmentRepository.find).toHaveBeenCalledWith({
        where: { animal: { uuid: animalUuid } },
      });
      expect(result).toBe(attachments);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if attachment does not exist', async () => {
      const uuid = 'attachment-uuid-123';

      mockAttachmentRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(attachmentsService.remove(uuid)).rejects.toThrow(new NotFoundException('Attachment does not exist'));

      expect(mockAttachmentRepository.findOneBy).toHaveBeenCalledWith({ uuid });
      expect(cloudflare.deleteFile).not.toHaveBeenCalled();
      expect(mockAttachmentRepository.remove).not.toHaveBeenCalled();
    });

    it('should delete file from cloudflare and remove attachment', async () => {
      const uuid = 'attachment-uuid-123';
      const attachment = mockAttachmentEntity({ uuid });

      mockAttachmentRepository.findOneBy.mockResolvedValueOnce(attachment);
      (cloudflare.deleteFile as jest.Mock).mockResolvedValueOnce(undefined);
      mockAttachmentRepository.remove.mockResolvedValueOnce(attachment);

      await attachmentsService.remove(uuid);

      expect(mockAttachmentRepository.findOneBy).toHaveBeenCalledWith({ uuid });
      expect(cloudflare.deleteFile).toHaveBeenCalledWith(attachment.url);
      expect(mockAttachmentRepository.remove).toHaveBeenCalledWith(attachment);
    });
  });
});
