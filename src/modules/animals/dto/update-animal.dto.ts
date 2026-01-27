import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AnimalStatus } from '../utils';
import { CreateAnimalDto } from './create-animal.dto';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @IsOptional()
  @IsEnum(AnimalStatus)
  @ApiProperty({ enum: AnimalStatus })
  status: AnimalStatus;
}
