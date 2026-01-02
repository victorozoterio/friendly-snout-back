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
import { MedicineApplicationFrequency } from 'src/modules/medicine-applications/utils';

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
  appliedAt: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  nextApplicationAt?: string;

  @ValidateIf((o) => !!o.nextApplicationAt)
  @IsNotEmpty()
  @IsEnum(MedicineApplicationFrequency)
  @ApiProperty({ enum: MedicineApplicationFrequency })
  frequency?: MedicineApplicationFrequency;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  endsAt?: string;
}
