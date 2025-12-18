import { ApiProperty } from '@nestjs/swagger';

export class MedicineBrandDto {
  @ApiProperty()
  name: string;
}
