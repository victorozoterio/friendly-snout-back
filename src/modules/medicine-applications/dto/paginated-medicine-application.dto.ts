import { ApiProperty } from '@nestjs/swagger';
import { PaginatedLinksDto, PaginatedMetaDto } from 'src/types';
import { MedicineApplicationDto } from './medicine-application.dto';

export class PaginatedMedicineApplicationDto {
  @ApiProperty({ type: MedicineApplicationDto, isArray: true })
  data: MedicineApplicationDto[];

  @ApiProperty()
  meta: PaginatedMetaDto;

  @ApiProperty()
  links: PaginatedLinksDto;
}
