import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMedicineApplicationsTableDropEndsAt1781660940164 implements MigrationInterface {
  name = 'AlterMedicineApplicationsTableDropEndsAt1781660940164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "ends_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "ends_at" TIMESTAMP WITH TIME ZONE`);
  }
}
