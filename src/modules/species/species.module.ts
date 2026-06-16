import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreedEntity } from './entities/breed.entity';
import { SpeciesEntity } from './entities/species.entity';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpeciesEntity, BreedEntity])],
  controllers: [SpeciesController],
  providers: [SpeciesService],
  exports: [SpeciesService],
})
export class SpeciesModule {}
