import {
  AnimalBreed,
  AnimalColor,
  AnimalFivAndFelv,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
  AnimalStatus,
} from 'src/utils';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('animals')
export class AnimalEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'sex', type: 'enum', enum: AnimalSex, nullable: false })
  sex: AnimalSex;

  @Column({ name: 'species', type: 'enum', enum: AnimalSpecies, nullable: false })
  species: AnimalSpecies;

  @Column({ name: 'breed', type: 'enum', enum: AnimalBreed, nullable: false })
  breed: AnimalBreed;

  @Column({ name: 'size', type: 'enum', enum: AnimalSize, nullable: false })
  size: AnimalSize;

  @Column({ name: 'color', type: 'enum', enum: AnimalColor, nullable: false })
  color: AnimalColor;

  @Column({ name: 'birth_date', type: 'timestamp', nullable: true })
  birthDate: Date;

  @Column({ name: 'microchip', type: 'varchar', nullable: true })
  microchip: string;

  @Column({ name: 'rga', type: 'varchar', nullable: true })
  rga: string;

  @Column({ name: 'castrated', type: 'boolean', nullable: false })
  castrated: boolean;

  @Column({ name: 'fiv', type: 'enum', enum: AnimalFivAndFelv, nullable: true })
  fiv: AnimalFivAndFelv;

  @Column({ name: 'felv', type: 'enum', enum: AnimalFivAndFelv, nullable: true })
  felv: AnimalFivAndFelv;

  @Column({ name: 'status', type: 'enum', enum: AnimalStatus, nullable: false })
  status: AnimalStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
