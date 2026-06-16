import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBreedDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;
}
