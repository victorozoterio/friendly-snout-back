import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAttachmentsTableSetAnimalFkOnDeleteCascade1770907430181 implements MigrationInterface {
  name = 'AlterAttachmentsTableSetAnimalFkOnDeleteCascade1770907430181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_6be9abb156a30d447df71d95044"`);
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_6be9abb156a30d447df71d95044" FOREIGN KEY ("animal_uuid") REFERENCES "animals"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_6be9abb156a30d447df71d95044"`);
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_6be9abb156a30d447df71d95044" FOREIGN KEY ("animal_uuid") REFERENCES "animals"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
