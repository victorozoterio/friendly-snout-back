import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpeciesAndBreedsTables1781563641887 implements MigrationInterface {
  name = 'CreateSpeciesAndBreedsTables1781563641887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_2056467e733e6c9e42a8f87504"`);
    await queryRunner.query(
      `CREATE TABLE "breeds" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "species_uuid" uuid, CONSTRAINT "UQ_464567a31313bb446dace79cdef" UNIQUE ("name", "species_uuid"), CONSTRAINT "PK_89a81ab45bd756904f3adddb9d9" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "species" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1adf701cac3b2c0f8bacb54774b" UNIQUE ("name"), CONSTRAINT "PK_f1a0ed44c50d2cd2e7f294770d5" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "species"`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "breed"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "species_uuid" uuid`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "breed_uuid" uuid`);
    await queryRunner.query(`CREATE INDEX "IDX_e39ed188646aeee4d27c468ef2" ON "animals" ("species_uuid", "status") `);
    await queryRunner.query(
      `ALTER TABLE "breeds" ADD CONSTRAINT "FK_8541edc31abe1f4e97e18098db2" FOREIGN KEY ("species_uuid") REFERENCES "species"("uuid") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "animals" ADD CONSTRAINT "FK_abb6b49ba862a04e55a1b76a0d5" FOREIGN KEY ("species_uuid") REFERENCES "species"("uuid") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "animals" ADD CONSTRAINT "FK_2a3637641aac684248f37de6b44" FOREIGN KEY ("breed_uuid") REFERENCES "breeds"("uuid") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "animals" DROP CONSTRAINT "FK_2a3637641aac684248f37de6b44"`);
    await queryRunner.query(`ALTER TABLE "animals" DROP CONSTRAINT "FK_abb6b49ba862a04e55a1b76a0d5"`);
    await queryRunner.query(`ALTER TABLE "breeds" DROP CONSTRAINT "FK_8541edc31abe1f4e97e18098db2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e39ed188646aeee4d27c468ef2"`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "breed_uuid"`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "species_uuid"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "breed" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "species" character varying NOT NULL`);
    await queryRunner.query(`DROP TABLE "species"`);
    await queryRunner.query(`DROP TABLE "breeds"`);
    await queryRunner.query(`CREATE INDEX "IDX_2056467e733e6c9e42a8f87504" ON "animals" ("species", "status") `);
  }
}
