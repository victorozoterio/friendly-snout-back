import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  AnimalBreed,
  AnimalColor,
  AnimalFivAndFelv,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
  AnimalStatus,
} from 'src/utils';

export class CreateAnimalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(AnimalSex)
  sex: AnimalSex;

  @IsNotEmpty()
  @IsEnum(AnimalSpecies)
  species: AnimalSpecies;

  @IsNotEmpty()
  @IsEnum(AnimalBreed)
  breed: AnimalBreed;

  @IsNotEmpty()
  @IsEnum(AnimalSize)
  size: AnimalSize;

  @IsNotEmpty()
  @IsEnum(AnimalColor)
  color: AnimalColor;

  @IsOptional()
  @IsString()
  birthDate: string;

  @IsOptional()
  @IsString()
  microchip: string;

  @IsOptional()
  @IsString()
  rga: string;

  @IsNotEmpty()
  @IsBoolean()
  castrated: boolean;

  @IsOptional()
  @IsEnum(AnimalFivAndFelv)
  fiv: AnimalFivAndFelv;

  @IsOptional()
  @IsEnum(AnimalFivAndFelv)
  felv: AnimalFivAndFelv;

  @IsNotEmpty()
  @IsEnum(AnimalStatus)
  status: AnimalStatus;

  @IsOptional()
  @IsString()
  notes: string;
}
