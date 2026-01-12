import { MigrationInterface, QueryRunner } from "typeorm";

export class ProjectAndProjectUserEntityAddedMigration1763720257197 implements MigrationInterface {
  name = 'ProjectAndProjectUserEntityAddedMigration1763720257197'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "Projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b25c37f2cdf0161b4f10ed3121c" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "public"."ProjectUsers_role_enum" AS ENUM('creator', 'admin', 'reviewer', 'contributor')`);
    await queryRunner.query(`CREATE TABLE "ProjectUsers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "projectId" uuid NOT NULL, "role" "public"."ProjectUsers_role_enum" NOT NULL DEFAULT 'creator', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0fe76b954bdf6cf04d6176a665d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "ProjectUsers" ADD CONSTRAINT "FK_20de26d82edeb26a5e041a40918" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ProjectUsers" DROP CONSTRAINT "FK_20de26d82edeb26a5e041a40918"`);
    await queryRunner.query(`DROP TABLE "ProjectUsers"`);
    await queryRunner.query(`DROP TYPE "public"."ProjectUsers_role_enum"`);
    await queryRunner.query(`DROP TABLE "Projects"`);
  }

}
