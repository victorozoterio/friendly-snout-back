import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachmentsTable1768083364711 implements MigrationInterface {
  name = 'CreateAttachmentsTable1768083364711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "attachments" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "animal_uuid" uuid, CONSTRAINT "UQ_c681692e418e624766e1bb52756" UNIQUE ("url"), CONSTRAINT "UQ_608cca8404ffb093aaed944ba05" UNIQUE ("name", "animal_uuid"), CONSTRAINT "PK_9f90471c974587aa09622e3c1d3" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_6be9abb156a30d447df71d95044" FOREIGN KEY ("animal_uuid") REFERENCES "animals"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_6be9abb156a30d447df71d95044"`);
    await queryRunner.query(`DROP TABLE "attachments"`);
  }
}
