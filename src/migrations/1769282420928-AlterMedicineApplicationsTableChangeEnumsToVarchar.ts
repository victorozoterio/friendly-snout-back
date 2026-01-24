import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMedicineApplicationsTableChangeEnumsToVarchar1769282420928 implements MigrationInterface {
  name = 'AlterMedicineApplicationsTableChangeEnumsToVarchar1769282420928';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "frequency"`);
    await queryRunner.query(`DROP TYPE "public"."medicine_applications_frequency_enum"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "frequency" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "frequency"`);
    await queryRunner.query(
      `CREATE TYPE "public"."medicine_applications_frequency_enum" AS ENUM('does-not-repeat', 'every-weekday', 'daily', 'weekly', 'monthly', 'yearly')`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicine_applications" ADD "frequency" "public"."medicine_applications_frequency_enum"`,
    );
  }
}
