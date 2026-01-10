import { ApiProperty } from '@nestjs/swagger';

export class AttachmentDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  createdAt: Date;
}
