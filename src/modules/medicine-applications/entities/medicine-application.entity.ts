import { AnimalEntity } from 'src/modules/animals/entities/animal.entity';
import { MedicineApplicationFrequency } from 'src/modules/medicine-applications/utils';
import { MedicineEntity } from 'src/modules/medicines/entities/medicine.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medicine_applications')
export class MedicineApplicationEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'quantity', type: 'integer', nullable: false })
  quantity: number;

  @Column({ name: 'applied_at', type: 'timestamp', nullable: false })
  appliedAt: Date;

  @Column({ name: 'next_application_at', type: 'timestamp', nullable: true })
  nextApplicationAt: Date | null;

  @Column({ name: 'frequency', type: 'enum', enum: MedicineApplicationFrequency, nullable: true })
  frequency: MedicineApplicationFrequency | null;

  @Column({ name: 'ends_at', type: 'timestamp', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'google_calendar_event_id', type: 'varchar', nullable: true })
  googleCalendarEventId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(
    () => AnimalEntity,
    (animal) => animal.uuid,
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
