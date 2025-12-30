import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnimalsTable1763662363733 implements MigrationInterface {
  name = 'CreateAnimalsTable1763662363733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "animals_sex_enum" AS ENUM('male', 'female')`);
    await queryRunner.query(`CREATE TYPE "animals_species_enum" AS ENUM('dog', 'cat')`);
    await queryRunner.query(
      `CREATE TYPE "animals_breed_enum" AS ENUM('mixed-breed', 'shih-tzu', 'yorkshire-terrier', 'german-spitz', 'french-bulldog', 'poodle', 'lhasa-apso', 'golden-retriever', 'rottweiler', 'labrador-retriever', 'pug', 'german-shepherd', 'border-collie', 'long-haired-chihuahua', 'belgian-malinois', 'maltese')`,
    );
    await queryRunner.query(`CREATE TYPE "animals_size_enum" AS ENUM('small', 'medium', 'large')`);
    await queryRunner.query(
      `CREATE TYPE "animals_color_enum" AS ENUM('black', 'white', 'gray', 'brown', 'golden', 'cream', 'tan', 'speckled')`,
    );
    await queryRunner.query(`CREATE TYPE "animals_fiv_enum" AS ENUM('yes', 'no', 'not-tested')`);
    await queryRunner.query(`CREATE TYPE "animals_felv_enum" AS ENUM('yes', 'no', 'not-tested')`);
    await queryRunner.query(`CREATE TYPE "animals_status_enum" AS ENUM('quarantine', 'sheltered', 'adopted', 'lost')`);
    await queryRunner.query(
      `CREATE TABLE "animals" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "sex" "animals_sex_enum" NOT NULL, "species" "animals_species_enum" NOT NULL, "breed" "animals_breed_enum" NOT NULL, "size" "animals_size_enum" NOT NULL, "color" "animals_color_enum" NOT NULL, "birth_date" TIMESTAMP, "microchip" character varying, "rga" character varying, "castrated" boolean NOT NULL, "fiv" "animals_fiv_enum", "felv" "animals_felv_enum", "status" "animals_status_enum" NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d0bd787811d7ea67de44db3da91" PRIMARY KEY ("uuid"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "animals"`);
    await queryRunner.query(`DROP TYPE "animals_status_enum"`);
    await queryRunner.query(`DROP TYPE "animals_felv_enum"`);
    await queryRunner.query(`DROP TYPE "animals_fiv_enum"`);
    await queryRunner.query(`DROP TYPE "animals_color_enum"`);
    await queryRunner.query(`DROP TYPE "animals_size_enum"`);
    await queryRunner.query(`DROP TYPE "animals_breed_enum"`);
    await queryRunner.query(`DROP TYPE "animals_species_enum"`);
    await queryRunner.query(`DROP TYPE "animals_sex_enum"`);
  }
}
