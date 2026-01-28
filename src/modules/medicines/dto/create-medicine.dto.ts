import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicineDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsNotEmpty()
  @Min(-1)
  @IsNumber()
  @ApiProperty()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  medicineBrandUuid: string;
}
