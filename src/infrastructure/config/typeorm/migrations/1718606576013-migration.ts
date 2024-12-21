import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1718606576013 implements MigrationInterface {
  name = 'Migration1718606576013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_bypass_sign_in" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker" ADD "is_bypass_sign_in" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "worker" DROP COLUMN "is_bypass_sign_in"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "is_bypass_sign_in"`,
    );
  }
}
