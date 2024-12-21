import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721186592958 implements MigrationInterface {
  name = 'Migration1721186592958';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" ADD "signed_up_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "signed_up_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker" ADD "signed_up_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "worker" DROP COLUMN "signed_up_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "signed_up_at"`);
    await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "signed_up_at"`);
  }
}
