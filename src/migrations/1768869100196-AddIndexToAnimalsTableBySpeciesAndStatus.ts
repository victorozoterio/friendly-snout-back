import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToAnimalsTableBySpeciesAndStatus1768869100196 implements MigrationInterface {
  name = 'AddIndexToAnimalsTableBySpeciesAndStatus1768869100196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_2056467e733e6c9e42a8f87504" ON "animals" ("species", "status") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_2056467e733e6c9e42a8f87504"`);
  }
}
