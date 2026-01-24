import { ApiProperty } from '@nestjs/swagger';
import { PaginatedLinksDto, PaginatedMetaDto } from 'src/types';
import { AnimalDto } from './animal.dto';

export class PaginatedAnimalsDto {
  @ApiProperty({ type: AnimalDto, isArray: true })
  data: AnimalDto[];

  @ApiProperty()
  meta: PaginatedMetaDto;

  @ApiProperty()
  links: PaginatedLinksDto;
}
