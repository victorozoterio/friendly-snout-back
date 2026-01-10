import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { cloudflare } from 'src/lib';
import { Repository } from 'typeorm';
import { AnimalsService } from '../animals/animals.service';
import { AttachmentEntity } from './entities/attachment.entity';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly animalsService: AnimalsService,
    @InjectRepository(AttachmentEntity)
    private readonly repository: Repository<AttachmentEntity>,
  ) {}

  async create(animalUuid: string, file: Express.Multer.File) {
    const animal = await this.animalsService.findOne(animalUuid);

    const attachmentAlreadyExists = await this.repository.findOne({
      where: { name: file.originalname, animal: { uuid: animalUuid } },
    });
    if (attachmentAlreadyExists) throw new ConflictException('Attachment already exists');

    const fileType = file.mimetype.split('/')[1];
    const fileUrl = await cloudflare.uploadFile(animalUuid, file);

    const attachment = this.repository.create({ name: file.originalname, url: fileUrl, type: fileType, animal });
    return this.repository.save(attachment);
  }

  async findAllByAnimal(animalUuid: string) {
    return this.repository.find({ where: { animal: { uuid: animalUuid } } });
  }

  async remove(uuid: string) {
    const attachmentExists = await this.repository.findOneBy({ uuid });
    if (!attachmentExists) throw new NotFoundException('Attachment does not exist');

    await cloudflare.deleteFile(attachmentExists.url);
    await this.repository.remove(attachmentExists);
  }
}
