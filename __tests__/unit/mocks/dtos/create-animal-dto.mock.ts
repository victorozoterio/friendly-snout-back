import { CreateAnimalDto } from 'src/modules/animals/dto/create-animal.dto';
import { AnimalColor, AnimalFivAndFelv, AnimalSex, AnimalSize } from 'src/modules/animals/utils';

export const mockCreateAnimalDto = (): CreateAnimalDto => ({
  name: 'Rex',
  sex: AnimalSex.MALE,
  speciesUuid: 'ef490336-8639-44ca-874b-8d0836a7339d',
  breedUuid: '0fb489c4-f06d-4f81-8776-0d1993d7eb88',
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
