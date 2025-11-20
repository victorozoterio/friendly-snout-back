import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnimalsTable1763662363733 implements MigrationInterface {
  name = 'CreateAnimalsTable1763662363733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."animals_sex_enum" AS ENUM('male', 'female')`);
    await queryRunner.query(`CREATE TYPE "public"."animals_species_enum" AS ENUM('dog', 'cat')`);
    await queryRunner.query(
      `CREATE TYPE "public"."animals_breed_enum" AS ENUM('mixed-breed', 'shih-tzu', 'yorkshire-terrier', 'german-spitz', 'french-bulldog', 'poodle', 'lhasa-apso', 'golden-retriever', 'rottweiler', 'labrador-retriever', 'pug', 'german-shepherd', 'border-collie', 'long-haired-chihuahua', 'belgian-malinois', 'maltese')`,
    );
    await queryRunner.query(`CREATE TYPE "public"."animals_size_enum" AS ENUM('small', 'medium', 'large')`);
    await queryRunner.query(
      `CREATE TYPE "public"."animals_color_enum" AS ENUM('black', 'white', 'gray', 'brown', 'golden', 'cream', 'tan', 'speckled')`,
    );
    await queryRunner.query(`CREATE TYPE "public"."animals_fiv_enum" AS ENUM('yes', 'no', 'not-tested')`);
    await queryRunner.query(`CREATE TYPE "public"."animals_felv_enum" AS ENUM('yes', 'no', 'not-tested')`);
    await queryRunner.query(
      `CREATE TYPE "public"."animals_status_enum" AS ENUM('quarantine', 'sheltered', 'adopted', 'lost')`,
    );
    await queryRunner.query(
      `CREATE TABLE "animals" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "sex" "public"."animals_sex_enum" NOT NULL, "species" "public"."animals_species_enum" NOT NULL, "breed" "public"."animals_breed_enum" NOT NULL, "size" "public"."animals_size_enum" NOT NULL, "color" "public"."animals_color_enum" NOT NULL, "birth_date" TIMESTAMP, "microchip" character varying, "rga" character varying, "castrated" boolean NOT NULL, "fiv" "public"."animals_fiv_enum", "felv" "public"."animals_felv_enum", "status" "public"."animals_status_enum" NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d0bd787811d7ea67de44db3da91" PRIMARY KEY ("uuid"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "animals"`);
    await queryRunner.query(`DROP TYPE "public"."animals_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."animals_felv_enum"`);
    await queryRunner.query(`DROP TYPE "public"."animals_fiv_enum"`);
    await queryRunner.query(`DROP TYPE "public"."animals_color_enum"`);
    await queryRunner.query(`DROP TYPE "public"."animals_size_enum"`);
    await queryRunner.query(`DROP TYPE "public"."animals_breed_enum"`);
    await queryRunner.query(`DROP TYPE "public"."animals_species_enum"`);
    await queryRunner.query(`DROP TYPE "public"."animals_sex_enum"`);
  }
}
