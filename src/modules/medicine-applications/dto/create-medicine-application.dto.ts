import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Frequency } from 'src/utils';

export class CreateMedicineApplicationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  animalUuid: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  medicineUuid: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  quantity: number;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  appliedAt: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  nextApplicationAt?: Date;

  @ValidateIf((o) => !!o.nextApplicationAt)
  @IsNotEmpty()
  @IsEnum(Frequency)
  @ApiProperty({ enum: Frequency })
  frequency: Frequency;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  endsAt?: Date;
}
