import { ApiProperty } from '@nestjs/swagger';

export class TotalAnimalsPerStageDto {
  @ApiProperty()
  quarantine: number;

  @ApiProperty()
  sheltered: number;

  @ApiProperty()
  adopted: number;

  @ApiProperty()
  lost: number;
}
