import { MedicineEntity } from 'src/modules/medicines/entities/medicine.entity';
import { mockMedicineBrandEntity } from './medicine-brand-entity.mock';

export const mockMedicineEntity = (overrides?: Partial<MedicineEntity>): MedicineEntity => ({
  uuid: 'medicine-uuid-123',
  name: 'dorflex',
  description: 'semelhante ao original',
  quantity: 1,
  isActive: true,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  medicineBrand: mockMedicineBrandEntity(),
  ...overrides,
});
