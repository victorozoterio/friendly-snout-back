import { ApiProperty } from '@nestjs/swagger';
import { BreedDto } from './breed.dto';

export class SpeciesDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: BreedDto, isArray: true, required: false })
  breeds?: BreedDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
