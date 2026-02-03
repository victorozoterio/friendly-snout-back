import { AnimalEntity } from 'src/modules/animals/entities/animal.entity';
import { MedicineEntity } from 'src/modules/medicines/entities/medicine.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medicine_applications')
export class MedicineApplicationEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'quantity', type: 'integer', nullable: false })
  quantity: number;

  @Column({ name: 'applied_at', type: 'timestamptz', nullable: false })
  appliedAt: Date;

  @Column({ name: 'next_application_at', type: 'timestamptz', nullable: true })
  nextApplicationAt: Date | null;

  @Column({ name: 'frequency', type: 'varchar', nullable: true })
  frequency: string | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'google_calendar_event_id', type: 'varchar', nullable: true })
  googleCalendarEventId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(
    () => AnimalEntity,
    (animal) => animal.uuid,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'animal_uuid', referencedColumnName: 'uuid' })
  animal: AnimalEntity;

  @ManyToOne(
    () => MedicineEntity,
    (medicine) => medicine.uuid,
  )
  @JoinColumn({ name: 'medicine_uuid', referencedColumnName: 'uuid' })
  medicine: MedicineEntity;

  @ManyToOne(
    () => UserEntity,
    (user) => user.uuid,
  )
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserEntity;
}
