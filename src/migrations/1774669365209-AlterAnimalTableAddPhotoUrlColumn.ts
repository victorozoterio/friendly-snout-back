import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAnimalTableAddPhotoUrlColumn1774669365209 implements MigrationInterface {
  name = 'AlterAnimalTableAddPhotoUrlColumn1774669365209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "animals" ADD "photo_url" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "animals" DROP COLUMN "photo_url"`);
  }
}
