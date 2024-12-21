import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1723603163916 implements MigrationInterface {
    name = 'Migration1723603163916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "agreement_consulting" boolean`);
        await queryRunner.query(`ALTER TABLE "vendor_settlement" ALTER COLUMN "serviced_at" SET DEFAULT 'NOW()'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_settlement" ALTER COLUMN "serviced_at" SET DEFAULT '2024-08-13 08:04:23.929494+09'`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "agreement_consulting"`);
    }

}
