import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721639237667 implements MigrationInterface {
  name = 'Migration1721639237667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "sigungu_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sigungu_id"`);
  }
}
