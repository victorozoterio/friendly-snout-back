import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicinesTable1767115412330 implements MigrationInterface {
  name = 'CreateMedicinesTable1767115412330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "medicines" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "quantity" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "medicine_brand_uuid" uuid, CONSTRAINT "UQ_4f34e3259b37d1590588db4ad4a" UNIQUE ("name", "medicine_brand_uuid"), CONSTRAINT "PK_f273bf725e39952ef8ec978a484" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicines" ADD CONSTRAINT "FK_7f55051385c439db7cb965a1c6c" FOREIGN KEY ("medicine_brand_uuid") REFERENCES "medicine_brands"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicines" DROP CONSTRAINT "FK_7f55051385c439db7cb965a1c6c"`);
    await queryRunner.query(`DROP TABLE "medicines"`);
  }
}
