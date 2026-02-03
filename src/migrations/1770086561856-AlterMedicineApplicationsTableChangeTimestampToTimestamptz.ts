import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMedicineApplicationsTableChangeTimestampToTimestamptz1770086561856 implements MigrationInterface {
  name = 'AlterMedicineApplicationsTableChangeTimestampToTimestamptz1770086561856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "applied_at"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "applied_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "next_application_at"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "next_application_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "ends_at"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "ends_at" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "ends_at"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "ends_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "next_application_at"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "next_application_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "applied_at"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "applied_at" TIMESTAMP NOT NULL`);
  }
}
