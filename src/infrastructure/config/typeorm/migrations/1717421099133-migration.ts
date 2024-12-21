import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1717421099133 implements MigrationInterface {
  name = 'Migration1717421099133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "additional_wage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "amount" integer NOT NULL, "reason" character varying, "type" character varying NOT NULL, "request_id" uuid, "member_id" uuid, CONSTRAINT "PK_f93928ce8df2267e668c384ecce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bcb8129e31cd9912e410abe58c" ON "additional_wage" ("type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "additional_wage_changed_log" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "amount" integer NOT NULL, "origin_amount" integer NOT NULL, "action" character varying NOT NULL, "reason" character varying, "updated_by_id" uuid, "additional_wage_id" uuid, "wage_history_id" uuid, CONSTRAINT "PK_f6823c85e436d4fd63ab39fb6df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "extra_wage_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "amount" integer NOT NULL, "origin_amount" integer NOT NULL, "reason" text NOT NULL, "note" text, "status" character varying NOT NULL, "admin_id" uuid, "extra_wage_id" uuid, CONSTRAINT "PK_b9dd027e17089d99a12141bc8a3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "extra_wage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "settled_at" TIMESTAMP WITH TIME ZONE, "amount" integer NOT NULL DEFAULT '0', "reason" text NOT NULL, "note" text, "settlement_method" character varying NOT NULL, "status" character varying NOT NULL, "worker_id" uuid NOT NULL, "bank_name" character varying, "bank_code" integer, "account_number" character varying, CONSTRAINT "PK_fd0f4141ff31ae88cd6426124cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_member" ADD "wage_base_amount" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "housekeeping_request" ADD "wage_base_amount" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "wage_history" ADD "origin_amount" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage" ADD CONSTRAINT "FK_02d070df77cc5b5b1a0e1bc17dd" FOREIGN KEY ("request_id") REFERENCES "housekeeping_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage" ADD CONSTRAINT "FK_c810f1d6583934fecce684e6eae" FOREIGN KEY ("member_id") REFERENCES "team_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage_changed_log" ADD CONSTRAINT "FK_1271d79fc75a65d0ac578a6ffe3" FOREIGN KEY ("updated_by_id") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage_changed_log" ADD CONSTRAINT "FK_bc78047b715f59621d07f28739e" FOREIGN KEY ("additional_wage_id") REFERENCES "additional_wage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage_changed_log" ADD CONSTRAINT "FK_828d8a53ff87bdbe4fc3a2981cf" FOREIGN KEY ("wage_history_id") REFERENCES "wage_history"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "extra_wage_history" ADD CONSTRAINT "FK_17062b91a811cda5f779bd62fb4" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "extra_wage_history" ADD CONSTRAINT "FK_5bc53ce5551c99e060d83e4f8cd" FOREIGN KEY ("extra_wage_id") REFERENCES "extra_wage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "extra_wage" ADD CONSTRAINT "FK_c7389f25e6a4c2ba89946d81188" FOREIGN KEY ("worker_id") REFERENCES "worker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "extra_wage" DROP CONSTRAINT "FK_c7389f25e6a4c2ba89946d81188"`,
    );
    await queryRunner.query(
      `ALTER TABLE "extra_wage_history" DROP CONSTRAINT "FK_5bc53ce5551c99e060d83e4f8cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "extra_wage_history" DROP CONSTRAINT "FK_17062b91a811cda5f779bd62fb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage_changed_log" DROP CONSTRAINT "FK_828d8a53ff87bdbe4fc3a2981cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage_changed_log" DROP CONSTRAINT "FK_bc78047b715f59621d07f28739e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage_changed_log" DROP CONSTRAINT "FK_1271d79fc75a65d0ac578a6ffe3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage" DROP CONSTRAINT "FK_c810f1d6583934fecce684e6eae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "additional_wage" DROP CONSTRAINT "FK_02d070df77cc5b5b1a0e1bc17dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wage_history" DROP COLUMN "origin_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "housekeeping_request" DROP COLUMN "wage_base_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_member" DROP COLUMN "wage_base_amount"`,
    );
    await queryRunner.query(`DROP TABLE "extra_wage"`);
    await queryRunner.query(`DROP TABLE "extra_wage_history"`);
    await queryRunner.query(`DROP TABLE "additional_wage_changed_log"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bcb8129e31cd9912e410abe58c"`,
    );
    await queryRunner.query(`DROP TABLE "additional_wage"`);
  }
}
