import { ApiProperty } from '@nestjs/swagger';
import { Frequency } from 'src/utils';

export class MedicineApplicationDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  appliedAt: Date;

  @ApiProperty()
  nextApplicationAt: Date;

  @ApiProperty({ enum: Frequency })
  frequency: Frequency;

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
