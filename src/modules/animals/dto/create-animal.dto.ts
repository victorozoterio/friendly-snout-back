import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBooleanString, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { AnimalColor, AnimalFivAndFelv, AnimalSex, AnimalSize } from 'src/modules/animals/utils';

export class CreateAnimalDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(AnimalSex)
  @ApiProperty({ enum: AnimalSex })
  sex: AnimalSex;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  speciesUuid: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  breedUuid: string;

  @IsNotEmpty()
  @IsEnum(AnimalSize)
  @ApiProperty({ enum: AnimalSize })
  size: AnimalSize;

  @IsNotEmpty()
  @IsEnum(AnimalColor)
  @ApiProperty({ enum: AnimalColor })
  color: AnimalColor;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birthDate: Date;

  @IsOptional()
  @IsString()
  @ApiProperty()
  microchip: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  rga: string;

  @IsNotEmpty()
  @IsBooleanString()
  @ApiProperty()
  castrated: boolean;

  @IsOptional()
  @IsEnum(AnimalFivAndFelv)
  @ApiProperty({ enum: AnimalFivAndFelv })
  fiv: AnimalFivAndFelv;

  @IsOptional()
  @IsEnum(AnimalFivAndFelv)
  @ApiProperty({ enum: AnimalFivAndFelv })
  felv: AnimalFivAndFelv;

  @IsOptional()
  @IsString()
  @ApiProperty()
  notes: string;
}
