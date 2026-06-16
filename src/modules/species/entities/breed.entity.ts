import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { SpeciesEntity } from './species.entity';

@Entity('breeds')
@Unique(['name', 'species'])
export class BreedEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(
    () => SpeciesEntity,
    (species) => species.breeds,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'species_uuid', referencedColumnName: 'uuid' })
  species: SpeciesEntity;
}
