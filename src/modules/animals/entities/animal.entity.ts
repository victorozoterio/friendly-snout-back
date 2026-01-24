import { AnimalStatus } from 'src/modules/animals/utils';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('animals')
@Index(['species', 'status'])
export class AnimalEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'sex', type: 'varchar', nullable: false })
  sex: string;

  @Column({ name: 'species', type: 'varchar', nullable: false })
  species: string;

  @Column({ name: 'breed', type: 'varchar', nullable: false })
  breed: string;

  @Column({ name: 'size', type: 'varchar', nullable: false })
  size: string;

  @Column({ name: 'color', type: 'varchar', nullable: false })
  color: string;

  @Column({ name: 'birth_date', type: 'timestamp', nullable: true })
  birthDate: Date | null;

  @Column({ name: 'microchip', type: 'varchar', nullable: true })
  microchip: string | null;

  @Column({ name: 'rga', type: 'varchar', nullable: true })
  rga: string | null;

  @Column({ name: 'castrated', type: 'boolean', nullable: false })
  castrated: boolean;

  @Column({ name: 'fiv', type: 'varchar', nullable: false })
  fiv: string;

  @Column({ name: 'felv', type: 'varchar', nullable: false })
  felv: string;

  @Column({ name: 'status', type: 'varchar', nullable: false, default: AnimalStatus.QUARANTINE })
  status: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
