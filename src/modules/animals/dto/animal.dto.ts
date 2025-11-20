import { ApiProperty } from '@nestjs/swagger';
import {
  AnimalBreed,
  AnimalColor,
  AnimalFivAndFelv,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
  AnimalStatus,
} from 'src/utils';

export class AnimalDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AnimalSex })
  sex: AnimalSex;

  @ApiProperty({ enum: AnimalSpecies })
  species: AnimalSpecies;

  @ApiProperty({ enum: AnimalBreed })
  breed: AnimalBreed;

  @ApiProperty({ enum: AnimalSize })
  size: AnimalSize;

  @ApiProperty({ enum: AnimalColor })
  color: AnimalColor;

  @ApiProperty()
  birthDate: string;

  @ApiProperty()
  microchip: string;

  @ApiProperty()
  rga: string;

  @ApiProperty()
  castrated: boolean;

  @ApiProperty({ enum: AnimalFivAndFelv })
  fiv: AnimalFivAndFelv;

  @ApiProperty({ enum: AnimalFivAndFelv })
  felv: AnimalFivAndFelv;

  @ApiProperty({ enum: AnimalStatus })
  status: AnimalStatus;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
