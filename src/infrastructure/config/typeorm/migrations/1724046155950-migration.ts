import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1724046155950 implements MigrationInterface {
    name = 'Migration1724046155950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "banner" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "photo_url" character varying, "title" character varying NOT NULL, "link_url" character varying, "display_start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "display_end_date" TIMESTAMP WITH TIME ZONE, "status" character varying NOT NULL, "priority" integer NOT NULL, "description" text, CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pop_up" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "photo_url" character varying, "title" character varying NOT NULL, "link_url" character varying, "display_start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "display_end_date" TIMESTAMP WITH TIME ZONE, "status" character varying NOT NULL, "description" text, CONSTRAINT "PK_b9e8d5d05c301e1300b73a3f2fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organizing_whole_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "worker_comment" character varying, "additional_amount" integer, "is_report_submit" boolean, "status" character varying NOT NULL, "complete_report" character varying, "location_detail_id" uuid, "user_id" uuid, "worker_id" uuid, "estimate_estimate_date" TIMESTAMP WITH TIME ZONE NOT NULL, "estimate_delivered_date" TIMESTAMP WITH TIME ZONE, "estimate_status" character varying NOT NULL, "estimate_service_start_time" TIMESTAMP WITH TIME ZONE, "estimate_service_end_time" TIMESTAMP WITH TIME ZONE, "estimate_difficulty" character varying, "estimate_comment" text, "estimate_google_form_estimate" character varying, "estimate_estimate_amount" integer, "estimate_total_amount" integer, "estimate_discount_amount" integer, "estimate_additional_amount" integer, "estimate_cancel_reason" character varying array, "estimate_etc_cancel_reason" text, "estimate_leader" integer NOT NULL DEFAULT '0', "estimate_site_manager" integer NOT NULL DEFAULT '0', "estimate_main" integer NOT NULL DEFAULT '0', "estimate_sub" integer NOT NULL DEFAULT '0', "estimate_intern" integer NOT NULL DEFAULT '0', "housing_detail_housing_type" character varying NOT NULL, "housing_detail_size" character varying NOT NULL, "housing_detail_refrigerator" character varying NOT NULL, "housing_detail_space_info" character varying array NOT NULL, "housing_detail_focus_on" character varying, "housing_detail_etc_focus_on" character varying, "housing_detail_comment" text, "garbage_types" text array, "garbage_disposal_content" character varying, "memo" text, "matched_worker_ids" text array, "matched_at" TIMESTAMP WITH TIME ZONE, "matched_at_list" TIMESTAMP WITH TIME ZONE array, "review_by_user_id" character varying, "review_by_worker_id" character varying, "start_time" TIMESTAMP WITH TIME ZONE, "end_time" TIMESTAMP WITH TIME ZONE, "real_start_time" TIMESTAMP WITH TIME ZONE, "real_end_time" TIMESTAMP WITH TIME ZONE, "additional_time" real, CONSTRAINT "PK_be415b9a4fd0acbb74c7a36020c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organizing_whole_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "role" character varying NOT NULL, "worker_id" uuid, "organizing_whole_request_id" uuid, "wage_admin_id" uuid, "wage_status" character varying, "wage_worker_refund_charge" integer DEFAULT '0', "wage_amount" integer, "wage_base_amount" integer, "wage_reason" character varying, "wage_settled_at" TIMESTAMP WITH TIME ZONE, "wage_bank_account_bank" character varying, "wage_bank_account_account_number" character varying, "wage_bank_account_account_holder" character varying, CONSTRAINT "PK_3416e6770fb1aae798a620cd612" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "update_logs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "resource_id" character varying, "detail" character varying, "updater_info" jsonb, "old_value" jsonb, "new_value" jsonb, "status" character varying, "request_id" character varying, "resource_first_tier" character varying, "resource_second_tier" character varying, "resource_third_tier" jsonb, CONSTRAINT "PK_48e11f24c5d474427120a1ae5f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "not_disturb_mode" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_test_account" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "location_detail" ADD "parking_availability" character varying`);
        await queryRunner.query(`ALTER TABLE "location_detail" ADD "parking_comment" character varying`);
        await queryRunner.query(`ALTER TABLE "worker" ADD "is_test_account" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "worker" ADD "meta_not_disturb_mode" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order" ADD "organizing_whole_order_type" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "additional_amount_reason" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "organizing_whole_request_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order" ADD "agreement_consulting" boolean`);
        await queryRunner.query(`ALTER TABLE "additional_wage" ADD "whole_member_id" uuid`);
        await queryRunner.query(`ALTER TABLE "wage_history" ADD "whole_member_id" uuid`);
        await queryRunner.query(`ALTER TABLE "vendor_settlement" ALTER COLUMN "serviced_at" SET DEFAULT 'NOW()'`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_fb324d6c3b69e482cae74150d6e" FOREIGN KEY ("organizing_whole_request_id") REFERENCES "organizing_whole_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_request" ADD CONSTRAINT "FK_1b6557843c2589403157ca919ce" FOREIGN KEY ("location_detail_id") REFERENCES "location_detail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_request" ADD CONSTRAINT "FK_447e5ecad6150a480a3641b47d1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_request" ADD CONSTRAINT "FK_36fe3e07435e92616c436fe56ab" FOREIGN KEY ("worker_id") REFERENCES "worker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_member" ADD CONSTRAINT "FK_6c19516967869b80d969140dd1d" FOREIGN KEY ("worker_id") REFERENCES "worker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_member" ADD CONSTRAINT "FK_80770f22e5cd2d34c521000a6f8" FOREIGN KEY ("organizing_whole_request_id") REFERENCES "organizing_whole_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_member" ADD CONSTRAINT "FK_e240d8f7b4e8b12a087703be09c" FOREIGN KEY ("wage_admin_id") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "additional_wage" ADD CONSTRAINT "FK_f4f43804ea0c7bc435f4eec0e5d" FOREIGN KEY ("whole_member_id") REFERENCES "organizing_whole_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wage_history" ADD CONSTRAINT "FK_1a1efa9cbdace5c01cf579e214b" FOREIGN KEY ("whole_member_id") REFERENCES "organizing_whole_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wage_history" DROP CONSTRAINT "FK_1a1efa9cbdace5c01cf579e214b"`);
        await queryRunner.query(`ALTER TABLE "additional_wage" DROP CONSTRAINT "FK_f4f43804ea0c7bc435f4eec0e5d"`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_member" DROP CONSTRAINT "FK_e240d8f7b4e8b12a087703be09c"`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_member" DROP CONSTRAINT "FK_80770f22e5cd2d34c521000a6f8"`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_member" DROP CONSTRAINT "FK_6c19516967869b80d969140dd1d"`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_request" DROP CONSTRAINT "FK_36fe3e07435e92616c436fe56ab"`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_request" DROP CONSTRAINT "FK_447e5ecad6150a480a3641b47d1"`);
        await queryRunner.query(`ALTER TABLE "organizing_whole_request" DROP CONSTRAINT "FK_1b6557843c2589403157ca919ce"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_fb324d6c3b69e482cae74150d6e"`);
        await queryRunner.query(`ALTER TABLE "vendor_settlement" ALTER COLUMN "serviced_at" SET DEFAULT '2024-07-25 08:53:05.729646+00'`);
        await queryRunner.query(`ALTER TABLE "wage_history" DROP COLUMN "whole_member_id"`);
        await queryRunner.query(`ALTER TABLE "additional_wage" DROP COLUMN "whole_member_id"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "agreement_consulting"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "organizing_whole_request_id"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "additional_amount_reason"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "organizing_whole_order_type"`);
        await queryRunner.query(`ALTER TABLE "worker" DROP COLUMN "meta_not_disturb_mode"`);
        await queryRunner.query(`ALTER TABLE "worker" DROP COLUMN "is_test_account"`);
        await queryRunner.query(`ALTER TABLE "location_detail" DROP COLUMN "parking_comment"`);
        await queryRunner.query(`ALTER TABLE "location_detail" DROP COLUMN "parking_availability"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_test_account"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "not_disturb_mode"`);
        await queryRunner.query(`DROP TABLE "update_logs"`);
        await queryRunner.query(`DROP TABLE "organizing_whole_member"`);
        await queryRunner.query(`DROP TABLE "organizing_whole_request"`);
        await queryRunner.query(`DROP TABLE "pop_up"`);
        await queryRunner.query(`DROP TABLE "banner"`);
    }

}
