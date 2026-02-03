import { CreateMedicineApplicationDto } from 'src/modules/medicine-applications/dto/create-medicine-application.dto';
import { MedicineApplicationFrequency } from 'src/modules/medicine-applications/utils';

export const mockCreateMedicineApplicationDto = (
  overrides?: Partial<CreateMedicineApplicationDto>,
): CreateMedicineApplicationDto => ({
  medicineUuid: 'medicine-uuid-123',
  quantity: 1,
  appliedAt: '2024-01-10T10:00:00Z',
  nextApplicationAt: '2024-01-17T10:00:00Z',
  frequency: MedicineApplicationFrequency.WEEKLY,
  endsAt: '2024-02-10T10:00:00Z',
  ...overrides,
});
