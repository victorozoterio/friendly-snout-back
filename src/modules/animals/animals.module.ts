import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeciesModule } from '../species/species.module';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';
import { AnimalEntity } from './entities/animal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnimalEntity]), SpeciesModule],
  controllers: [AnimalsController],
  providers: [AnimalsService],
  exports: [AnimalsService],
})
export class AnimalsModule {}
