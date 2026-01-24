import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAnimalTableChangeEnumsToVarchar1769281725715 implements MigrationInterface {
  name = 'AlterAnimalTableChangeEnumsToVarchar1769281725715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_2056467e733e6c9e42a8f87504"`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "sex"`);
    await queryRunner.query(`DROP TYPE "public"."animals_sex_enum"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "sex" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "species"`);
    await queryRunner.query(`DROP TYPE "public"."animals_species_enum"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "species" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "breed"`);
    await queryRunner.query(`DROP TYPE "public"."animals_breed_enum"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "breed" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "size"`);
    await queryRunner.query(`DROP TYPE "public"."animals_size_enum"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "size" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "color"`);
    await queryRunner.query(`DROP TYPE "public"."animals_color_enum"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "color" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "fiv"`);
    await queryRunner.query(`DROP TYPE "public"."animals_fiv_enum"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "fiv" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "felv"`);
    await queryRunner.query(`DROP TYPE "public"."animals_felv_enum"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "felv" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."animals_status_enum"`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "status" character varying NOT NULL DEFAULT 'quarentena'`);
    await queryRunner.query(`CREATE INDEX "IDX_2056467e733e6c9e42a8f87504" ON "animals" ("species", "status") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_2056467e733e6c9e42a8f87504"`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."animals_status_enum" AS ENUM('quarantine', 'sheltered', 'adopted', 'lost')`,
    );
    await queryRunner.query(
      `ALTER TABLE "animals" ADD "status" "public"."animals_status_enum" NOT NULL DEFAULT 'quarantine'`,
    );
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "felv"`);
    await queryRunner.query(`CREATE TYPE "public"."animals_felv_enum" AS ENUM('yes', 'no', 'not-tested')`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "felv" "public"."animals_felv_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "fiv"`);
    await queryRunner.query(`CREATE TYPE "public"."animals_fiv_enum" AS ENUM('yes', 'no', 'not-tested')`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "fiv" "public"."animals_fiv_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "color"`);
    await queryRunner.query(
      `CREATE TYPE "public"."animals_color_enum" AS ENUM('black', 'white', 'gray', 'brown', 'golden', 'cream', 'tan', 'speckled')`,
    );
    await queryRunner.query(`ALTER TABLE "animals" ADD "color" "public"."animals_color_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "size"`);
    await queryRunner.query(`CREATE TYPE "public"."animals_size_enum" AS ENUM('small', 'medium', 'large')`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "size" "public"."animals_size_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "breed"`);
    await queryRunner.query(
      `CREATE TYPE "public"."animals_breed_enum" AS ENUM('mixed-breed', 'shih-tzu', 'yorkshire-terrier', 'german-spitz', 'french-bulldog', 'poodle', 'lhasa-apso', 'golden-retriever', 'rottweiler', 'labrador-retriever', 'pug', 'german-shepherd', 'border-collie', 'long-haired-chihuahua', 'belgian-malinois', 'maltese')`,
    );
    await queryRunner.query(`ALTER TABLE "animals" ADD "breed" "public"."animals_breed_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "species"`);
    await queryRunner.query(`CREATE TYPE "public"."animals_species_enum" AS ENUM('dog', 'cat')`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "species" "public"."animals_species_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "sex"`);
    await queryRunner.query(`CREATE TYPE "public"."animals_sex_enum" AS ENUM('male', 'female')`);
    await queryRunner.query(`ALTER TABLE "animals" ADD "sex" "public"."animals_sex_enum" NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_2056467e733e6c9e42a8f87504" ON "animals" ("species", "status") `);
  }
}
