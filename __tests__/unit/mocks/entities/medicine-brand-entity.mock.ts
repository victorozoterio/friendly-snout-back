import { MedicineBrandEntity } from 'src/modules/medicine-brands/entities/medicine-brand.entity';

export const mockMedicineBrandEntity = (overrides?: Partial<MedicineBrandEntity>): MedicineBrandEntity => ({
  uuid: 'brand-uuid-123',
  name: 'Vetnil',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  ...overrides,
});
