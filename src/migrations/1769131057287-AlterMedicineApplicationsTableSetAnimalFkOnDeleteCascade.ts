import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMedicineApplicationsTableSetAnimalFkOnDeleteCascade1769131057287 implements MigrationInterface {
  name = 'AlterMedicineApplicationsTableSetAnimalFkOnDeleteCascade1769131057287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP CONSTRAINT "FK_2af76aedb43a4d3a9aa69225ae0"`);
    await queryRunner.query(
      `ALTER TABLE "medicine_applications" ADD CONSTRAINT "FK_2af76aedb43a4d3a9aa69225ae0" FOREIGN KEY ("animal_uuid") REFERENCES "animals"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP CONSTRAINT "FK_2af76aedb43a4d3a9aa69225ae0"`);
    await queryRunner.query(
      `ALTER TABLE "medicine_applications" ADD CONSTRAINT "FK_2af76aedb43a4d3a9aa69225ae0" FOREIGN KEY ("animal_uuid") REFERENCES "animals"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
