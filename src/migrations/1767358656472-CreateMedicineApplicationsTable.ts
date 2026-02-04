import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicineApplicationsTable1767358656472 implements MigrationInterface {
  name = 'CreateMedicineApplicationsTable1767358656472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "medicine_applications_frequency_enum" AS ENUM (
        'does-not-repeat',
        'every-weekday',
        'daily',
        'weekly',
        'monthly',
        'yearly'
      )
    `);
    await queryRunner.query(
      `CREATE TABLE "medicine_applications" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "applied_at" TIMESTAMP NOT NULL, "next_application_at" TIMESTAMP, "frequency" "medicine_applications_frequency_enum", "ends_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "animal_uuid" uuid, "medicine_uuid" uuid, "user_uuid" uuid, CONSTRAINT "PK_ed03625ae568f55ac2353d365fd" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicine_applications" ADD CONSTRAINT "FK_2af76aedb43a4d3a9aa69225ae0" FOREIGN KEY ("animal_uuid") REFERENCES "animals"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicine_applications" ADD CONSTRAINT "FK_0cd589695c3d49f97e4f551d149" FOREIGN KEY ("medicine_uuid") REFERENCES "medicines"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicine_applications" ADD CONSTRAINT "FK_d0e0464d4923b7bdc9e0d9cd8ea" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP CONSTRAINT "FK_d0e0464d4923b7bdc9e0d9cd8ea"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP CONSTRAINT "FK_0cd589695c3d49f97e4f551d149"`);
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP CONSTRAINT "FK_2af76aedb43a4d3a9aa69225ae0"`);
    await queryRunner.query(`DROP TABLE "medicine_applications"`);
  }
}
