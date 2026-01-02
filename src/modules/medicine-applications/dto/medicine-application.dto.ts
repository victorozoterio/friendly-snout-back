import { ApiProperty } from '@nestjs/swagger';
import { MedicineApplicationFrequency } from 'src/modules/medicine-applications/utils';

export class MedicineApplicationDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  appliedAt: Date;

  @ApiProperty()
  nextApplicationAt: Date;

  @ApiProperty({ enum: MedicineApplicationFrequency })
  frequency: MedicineApplicationFrequency;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty()
  googleCalendarEventId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  animal: object;

  @ApiProperty()
  medicine: object;

  @ApiProperty()
  user: object;
}
