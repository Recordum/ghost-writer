import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1719317207991 implements MigrationInterface {
  name = 'Migration1719317207991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "housekeeping_request" ADD "seq" integer DEFAULT '-1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "housekeeping_request" DROP COLUMN "seq"`,
    );
  }
}
