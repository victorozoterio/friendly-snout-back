import { ApiProperty } from '@nestjs/swagger';
import { PaginatedLinksDto, PaginatedMetaDto } from 'src/types';
import { MedicineBrandDto } from './medicine-brand.dto';

export class PaginatedMedicineBrandsDto {
  @ApiProperty({ type: MedicineBrandDto, isArray: true })
  data: MedicineBrandDto[];

  @ApiProperty()
  meta: PaginatedMetaDto;

  @ApiProperty()
  links: PaginatedLinksDto;
}
