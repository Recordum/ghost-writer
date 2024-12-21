import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1719454286861 implements MigrationInterface {
  name = 'Migration1719454286861';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription_two_day_exception" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "request_id" character varying NOT NULL, "subscription_id" character varying NOT NULL, "status" character varying NOT NULL, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_cf67bcb7d097528b34c8d6657e4" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subscription_two_day_exception"`);
  }
}
