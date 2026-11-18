import { MedicineApplicationEntity } from 'src/modules/medicine-applications/entities/medicine-application.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PushNotificationJobStatus {
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
}

@Entity('push_notification_jobs')
@Index(['medicineApplication', 'user', 'occurrenceAt'], { unique: true })
export class PushNotificationJobEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'occurrence_at', type: 'timestamptz' })
  occurrenceAt: Date;

  @Index()
  @Column({ name: 'send_at', type: 'timestamptz' })
  sendAt: Date;

  @Index()
  @Column({ name: 'status', type: 'varchar', default: PushNotificationJobStatus.PENDING })
  status: PushNotificationJobStatus;

  @Column({ name: 'attempts', type: 'integer', default: 0 })
  attempts: number;

  @Column({ name: 'locked_at', type: 'timestamptz', nullable: true })
  lockedAt: Date | null;

  @Column({ name: 'expo_tickets', type: 'jsonb', nullable: true })
  expoTickets: { id: string; expoPushToken: string }[] | null;

  @Column({ name: 'receipt_checked_at', type: 'timestamptz', nullable: true })
  receiptCheckedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(
    () => MedicineApplicationEntity,
    (medicineApplication) => medicineApplication.uuid,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'medicine_application_uuid', referencedColumnName: 'uuid' })
  medicineApplication: MedicineApplicationEntity;

  @ManyToOne(
    () => UserEntity,
    (user) => user.uuid,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserEntity;
}
