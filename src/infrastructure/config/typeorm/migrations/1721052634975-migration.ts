import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721052634975 implements MigrationInterface {
  name = 'Migration1721052634975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "operation_flag" ADD "phone_number" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "operation_flag" DROP COLUMN "phone_number"`,
    );
  }
}
