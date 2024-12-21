import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721897537432 implements MigrationInterface {
  name = 'Migration1721897537432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor_settlement" ADD "serviced_at" TIMESTAMP WITH TIME ZONE DEFAULT 'NOW()'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_settlement" ADD "service_price" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_settlement" ADD "payment_amount" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_settlement" ADD "reference_id" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor_settlement" DROP COLUMN "reference_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_settlement" DROP COLUMN "payment_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_settlement" DROP COLUMN "service_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_settlement" DROP COLUMN "serviced_at"`,
    );
  }
}
