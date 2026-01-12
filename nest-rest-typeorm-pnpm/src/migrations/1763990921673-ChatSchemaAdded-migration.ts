import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatSchemaAddedMigration1763990921673 implements MigrationInterface {
  name = 'ChatSchemaAddedMigration1763990921673'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."Chats_type_enum" AS ENUM('prd', 'ticket')`);
    await queryRunner.query(`CREATE TABLE "Chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "prompt" character varying NOT NULL, "type" "public"."Chats_type_enum" NOT NULL DEFAULT 'prd', "schema" jsonb, "userId" uuid NOT NULL, "projectId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_64c36c2b8d86a0d5de4cf64de8d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "Chats" ADD CONSTRAINT "FK_4af252cd39d747308b42f3b1eb3" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "Chats" ADD CONSTRAINT "FK_a3ef34f6e1de9dfe5af6cf66a25" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Chats" DROP CONSTRAINT "FK_a3ef34f6e1de9dfe5af6cf66a25"`);
    await queryRunner.query(`ALTER TABLE "Chats" DROP CONSTRAINT "FK_4af252cd39d747308b42f3b1eb3"`);
    await queryRunner.query(`DROP TABLE "Chats"`);
    await queryRunner.query(`DROP TYPE "public"."Chats_type_enum"`);
  }

}
