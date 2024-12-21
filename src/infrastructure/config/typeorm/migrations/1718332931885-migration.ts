import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1718332931885 implements MigrationInterface {
  name = 'Migration1718332931885';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "operation_flag" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying, "flag" boolean, CONSTRAINT "PK_f42f75aeb5bd6f8775296bfe2c3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "operation_flag"`);
  }
}
