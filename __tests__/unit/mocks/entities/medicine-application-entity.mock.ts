import { MedicineApplicationEntity } from 'src/modules/medicine-applications/entities/medicine-application.entity';
import { MedicineApplicationFrequency } from 'src/modules/medicine-applications/utils';
import { mockAnimalEntity } from './animal-entity.mock';
import { mockMedicineEntity } from './medicine-entity.mock';
import { mockUserEntity } from './user-entity.mock';

export const mockMedicineApplicationEntity = (
  overrides?: Partial<MedicineApplicationEntity>,
): MedicineApplicationEntity => ({
  uuid: 'application-uuid-123',
  quantity: 1,
  appliedAt: new Date('2024-01-10'),
  nextApplicationAt: new Date('2024-01-17'),
  frequency: MedicineApplicationFrequency.WEEKLY,
  endsAt: new Date('2024-02-10'),
  googleCalendarEventId: 'event-id-123',
  createdAt: new Date('2024-01-10'),
  animal: mockAnimalEntity(),
  medicine: mockMedicineEntity(),
  user: mockUserEntity(),
  ...overrides,
});
