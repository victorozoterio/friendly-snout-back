import { AnimalEntity } from 'src/modules/animals/entities/animal.entity';
import { AnimalColor, AnimalFivAndFelv, AnimalSex, AnimalSize, AnimalStatus } from 'src/modules/animals/utils';
import { BreedEntity } from 'src/modules/species/entities/breed.entity';
import { SpeciesEntity } from 'src/modules/species/entities/species.entity';

const species: SpeciesEntity = {
  uuid: 'ef490336-8639-44ca-874b-8d0836a7339d',
  name: 'cachorro',
  breeds: [],
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
};

const breed: BreedEntity = {
  uuid: '0fb489c4-f06d-4f81-8776-0d1993d7eb88',
  name: 'S.R.D.',
  species: species,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
};

species.breeds = [breed];

export const mockAnimalEntity = (overrides?: Partial<AnimalEntity>): AnimalEntity => ({
  uuid: '123',
  name: 'Rex',
  sex: AnimalSex.MALE,
  species,
  breed,
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
  photoUrl: null,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  ...overrides,
});
