import { ApiProperty } from '@nestjs/swagger';
import { AnimalFivAndFelv, AnimalSex, AnimalSize, AnimalStatus } from 'src/modules/animals/utils';
import { BreedDto } from 'src/modules/species/dto/breed.dto';
import { SpeciesDto } from 'src/modules/species/dto/species.dto';

export class AnimalDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AnimalSex })
  sex: AnimalSex;

  @ApiProperty({ type: SpeciesDto })
  species: SpeciesDto;

  @ApiProperty({ type: BreedDto })
  breed: BreedDto;

  @ApiProperty({ enum: AnimalSize })
  size: AnimalSize;

  @ApiProperty()
  color: string;

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
