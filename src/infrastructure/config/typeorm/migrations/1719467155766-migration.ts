import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1719467155766 implements MigrationInterface {
  name = 'Migration1719467155766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_blocked" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_blocked"`);
  }
}
