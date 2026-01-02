import { CreateAnimalDto } from 'src/modules/animals/dto/create-animal.dto';
import {
  AnimalBreed,
  AnimalColor,
  AnimalFivAndFelv,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
} from 'src/modules/animals/utils';

export const mockCreateAnimalDto = (): CreateAnimalDto => ({
  name: 'Rex',
  sex: AnimalSex.MALE,
  species: AnimalSpecies.DOG,
  breed: AnimalBreed.MIXED_BREED,
  size: AnimalSize.SMALL,
  color: AnimalColor.BLACK,
  birthDate: new Date('2018-06-15'),
  microchip: 'MICRO-000123',
  rga: 'RGA-2024-001',
  castrated: true,
  fiv: AnimalFivAndFelv.NOT_TESTED,
  felv: AnimalFivAndFelv.NOT_TESTED,
  notes: 'Animal resgatado, comportamento dócil e sociável.',
});
