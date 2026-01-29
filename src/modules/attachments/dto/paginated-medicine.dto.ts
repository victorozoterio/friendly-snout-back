import { ApiProperty } from '@nestjs/swagger';
import { PaginatedLinksDto, PaginatedMetaDto } from 'src/types';
import { AttachmentDto } from './attachment.dto';

export class PaginatedAttachmentDto {
  @ApiProperty({ type: AttachmentDto, isArray: true })
  data: AttachmentDto[];

  @ApiProperty()
  meta: PaginatedMetaDto;

  @ApiProperty()
  links: PaginatedLinksDto;
}
