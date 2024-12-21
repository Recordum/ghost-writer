import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1719990887773 implements MigrationInterface {
  name = 'Migration1719990887773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "matching_fail" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "service_id" character varying NOT NULL, "service_type" character varying NOT NULL, "service_sub_type" character varying NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_0cb83dbfb953cb00537c2aa3dca" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "matching_fail"`);
  }
}
