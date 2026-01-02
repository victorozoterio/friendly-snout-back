import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Frequency } from 'src/utils';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  summary: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  start: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  end?: string;

  @IsOptional()
  @IsEnum(Frequency)
  @ApiProperty({ enum: Frequency })
  frequency?: Frequency;
}
