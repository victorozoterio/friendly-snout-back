import { ApiProperty } from '@nestjs/swagger';
import { PaginatedLinksDto, PaginatedMetaDto } from 'src/types';
import { BreedDto } from './breed.dto';

export class PaginatedBreedsDto {
  @ApiProperty({ type: BreedDto, isArray: true })
  data: BreedDto[];

  @ApiProperty()
  meta: PaginatedMetaDto;

  @ApiProperty()
  links: PaginatedLinksDto;
}
