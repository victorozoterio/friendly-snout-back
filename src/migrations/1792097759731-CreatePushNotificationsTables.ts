import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePushNotificationsTables1792097759731 implements MigrationInterface {
  name = 'CreatePushNotificationsTables1792097759731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "push_devices" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "expo_push_token" character varying NOT NULL, "platform" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_uuid" uuid, CONSTRAINT "UQ_push_devices_expo_push_token" UNIQUE ("expo_push_token"), CONSTRAINT "PK_push_devices" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_push_devices_is_active" ON "push_devices" ("is_active")`);
    await queryRunner.query(
      `ALTER TABLE "push_devices" ADD CONSTRAINT "FK_push_devices_user" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "push_notification_jobs" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "occurrence_at" TIMESTAMP WITH TIME ZONE NOT NULL, "send_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "attempts" integer NOT NULL DEFAULT 0, "locked_at" TIMESTAMP WITH TIME ZONE, "expo_tickets" jsonb, "receipt_checked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "medicine_application_uuid" uuid, "user_uuid" uuid, CONSTRAINT "PK_push_notification_jobs" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_push_notification_jobs_send_at" ON "push_notification_jobs" ("send_at")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_push_notification_jobs_status" ON "push_notification_jobs" ("status")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_push_notification_jobs_occurrence" ON "push_notification_jobs" ("medicine_application_uuid", "user_uuid", "occurrence_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_jobs" ADD CONSTRAINT "FK_push_notification_jobs_application" FOREIGN KEY ("medicine_application_uuid") REFERENCES "medicine_applications"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_jobs" ADD CONSTRAINT "FK_push_notification_jobs_user" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "push_notification_jobs" DROP CONSTRAINT "FK_push_notification_jobs_user"`);
    await queryRunner.query(
      `ALTER TABLE "push_notification_jobs" DROP CONSTRAINT "FK_push_notification_jobs_application"`,
    );
    await queryRunner.query(`DROP TABLE "push_notification_jobs"`);
    await queryRunner.query(`ALTER TABLE "push_devices" DROP CONSTRAINT "FK_push_devices_user"`);
    await queryRunner.query(`DROP TABLE "push_devices"`);
  }
}
