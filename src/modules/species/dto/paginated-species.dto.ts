import { ApiProperty } from '@nestjs/swagger';
import { PaginatedLinksDto, PaginatedMetaDto } from 'src/types';
import { SpeciesDto } from './species.dto';

export class PaginatedSpeciesDto {
  @ApiProperty({ type: SpeciesDto, isArray: true })
  data: SpeciesDto[];

  @ApiProperty()
  meta: PaginatedMetaDto;

  @ApiProperty()
  links: PaginatedLinksDto;
}
