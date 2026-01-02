import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMedicineApplicationsTableAddGoogleCalendarEventId1767359804344 implements MigrationInterface {
  name = 'AlterMedicineApplicationsTableAddGoogleCalendarEventId1767359804344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" ADD "google_calendar_event_id" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_applications" DROP COLUMN "google_calendar_event_id"`);
  }
}
