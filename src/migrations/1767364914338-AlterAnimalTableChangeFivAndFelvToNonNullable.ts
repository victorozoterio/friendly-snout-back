import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAnimalTableChangeFivAndFelvToNonNullable1767364914338 implements MigrationInterface {
  name = 'AlterAnimalTableChangeFivAndFelvToNonNullable1767364914338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "animals" ALTER COLUMN "fiv" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" ALTER COLUMN "felv" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" ALTER COLUMN "status" SET DEFAULT 'quarantine'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "animals" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "animals" ALTER COLUMN "felv" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" ALTER COLUMN "fiv" DROP NOT NULL`);
  }
}
