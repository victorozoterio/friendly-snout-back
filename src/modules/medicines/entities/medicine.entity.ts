import { MedicineBrandEntity } from 'src/modules/medicine-brands/entities/medicine-brand.entity';
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

@Entity('medicines')
@Unique(['name', 'medicineBrand'])
export class MedicineEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'quantity', type: 'integer', nullable: false })
  quantity: number;

  @Column({ name: 'is_active', type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(
    () => MedicineBrandEntity,
    (medicineBrand) => medicineBrand.uuid,
  )
  @JoinColumn({ name: 'medicine_brand_uuid', referencedColumnName: 'uuid' })
  medicineBrand: MedicineBrandEntity;
}
