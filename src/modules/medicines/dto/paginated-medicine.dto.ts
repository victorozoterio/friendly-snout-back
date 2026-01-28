import { ApiProperty } from '@nestjs/swagger';
import { PaginatedLinksDto, PaginatedMetaDto } from 'src/types';
import { MedicineDto } from './medicine.dto';

export class PaginatedMedicineDto {
  @ApiProperty({ type: MedicineDto, isArray: true })
  data: MedicineDto[];

  @ApiProperty()
  meta: PaginatedMetaDto;

  @ApiProperty()
  links: PaginatedLinksDto;
}
