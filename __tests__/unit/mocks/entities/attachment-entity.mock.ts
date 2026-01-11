import { AttachmentEntity } from 'src/modules/attachments/entities/attachment.entity';
import { mockAnimalEntity } from './animal-entity.mock';

export const mockAttachmentEntity = (overrides?: Partial<AttachmentEntity>): AttachmentEntity => ({
  uuid: 'attachment-uuid-123',
  name: 'test-file.jpg',
  url: 'https://example.com/test-file.jpg',
  type: 'jpeg',
  createdAt: new Date('2024-01-10'),
  animal: mockAnimalEntity(),
  ...overrides,
});
