import { MigrationInterface, QueryRunner } from "typeorm";

export class ConnectionModelAddedMigration1763968220435 implements MigrationInterface {
  name = 'ConnectionModelAddedMigration1763968220435'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."Connections_type_enum" AS ENUM('jira', 'slack', 'figma', 'notion', 'clickup')`);
    await queryRunner.query(`CREATE TABLE "Connections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."Connections_type_enum" NOT NULL, "token" character varying NOT NULL, "refreshToken" character varying, "expiredAt" TIMESTAMP WITH TIME ZONE, "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_0ee1f6fd09d463a63ca7cded8b3" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "Connections" ADD CONSTRAINT "FK_d6f24d395c6e6099459afbdf439" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Connections" DROP CONSTRAINT "FK_d6f24d395c6e6099459afbdf439"`);
    await queryRunner.query(`DROP TABLE "Connections"`);
    await queryRunner.query(`DROP TYPE "public"."Connections_type_enum"`);
  }

}
