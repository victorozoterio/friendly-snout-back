import { ApiProperty } from '@nestjs/swagger';

export class PaginatedLinksDto {
  @ApiProperty({ required: false })
  first?: string;

  @ApiProperty({ required: false })
  previous?: string;

  @ApiProperty({ required: false })
  next?: string;

  @ApiProperty({ required: false })
  last?: string;
}

export class PaginatedMetaDto {
  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ type: Array, example: [['createdAt', 'DESC']] })
  sortBy: [string, 'ASC' | 'DESC'][];

  @ApiProperty({ required: false })
  search?: string;

  @ApiProperty({ required: false, type: Object })
  filter?: Record<string, unknown>;
}
