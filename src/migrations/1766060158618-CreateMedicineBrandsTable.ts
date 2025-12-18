import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicineBrandsTable1766060158618 implements MigrationInterface {
  name = 'CreateMedicineBrandsTable1766060158618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "medicine_brands" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_06480a1dd820f6c9c7d3660c320" UNIQUE ("name"), CONSTRAINT "PK_42eaf4dd805b973eb27de02f0e9" PRIMARY KEY ("uuid"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "medicine_brands"`);
  }
}
