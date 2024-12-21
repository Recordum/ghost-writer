import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1716983210311 implements MigrationInterface {
  name = 'Migration1716983210311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admin_audit_logs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "request_id" character varying, "method" character varying, "endpoint" character varying, "body" jsonb, "requester_info" jsonb, "network_info" jsonb, "status" character varying, "error_message" text, "error_stack" text, CONSTRAINT "PK_de7a8fc2fbb525484c71a86bb96" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin_audit_logs"`);
  }
}
