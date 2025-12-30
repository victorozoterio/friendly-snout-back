import { ApiProperty } from '@nestjs/swagger';

export class MedicineDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  medicineBrand: object;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
