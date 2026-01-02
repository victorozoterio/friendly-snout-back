import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  AnimalBreed,
  AnimalColor,
  AnimalFivAndFelv,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
} from 'src/modules/animals/utils';

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
  @IsEnum(AnimalSpecies)
  @ApiProperty({ enum: AnimalSpecies })
  species: AnimalSpecies;

  @IsNotEmpty()
  @IsEnum(AnimalBreed)
  @ApiProperty({ enum: AnimalBreed })
  breed: AnimalBreed;

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
  @IsBoolean()
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
