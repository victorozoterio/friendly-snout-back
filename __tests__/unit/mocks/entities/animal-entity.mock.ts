import { AnimalEntity } from 'src/modules/animals/entities/animal.entity';
import {
  AnimalBreed,
  AnimalColor,
  AnimalFivAndFelv,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
  AnimalStatus,
} from 'src/modules/animals/utils';

export const mockAnimalEntity = (): AnimalEntity => ({
  uuid: '123',
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
  status: AnimalStatus.QUARANTINE,
  notes: 'Animal resgatado, comportamento dócil e sociável.',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
});
