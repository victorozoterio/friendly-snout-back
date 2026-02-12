import { AnimalEntity } from 'src/modules/animals/entities/animal.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('attachments')
@Unique(['name', 'animal'])
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'url', type: 'varchar', unique: true, nullable: false })
  url: string;

  @Column({ name: 'type', type: 'varchar', nullable: false })
  type: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(
    () => AnimalEntity,
    (animal) => animal.uuid,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'animal_uuid', referencedColumnName: 'uuid' })
  animal: AnimalEntity;
}
