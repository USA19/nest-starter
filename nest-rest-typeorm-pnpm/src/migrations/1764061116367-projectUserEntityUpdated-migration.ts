import { MigrationInterface, QueryRunner } from "typeorm";

export class ProjectUserEntityUpdatedMigration1764061116367 implements MigrationInterface {
    name = 'ProjectUserEntityUpdatedMigration1764061116367'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ProjectUsers" DROP CONSTRAINT "FK_20de26d82edeb26a5e041a40918"`);
        await queryRunner.query(`ALTER TABLE "Chats" DROP CONSTRAINT "FK_4af252cd39d747308b42f3b1eb3"`);
        await queryRunner.query(`ALTER TABLE "Chats" DROP CONSTRAINT "FK_a3ef34f6e1de9dfe5af6cf66a25"`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" ADD CONSTRAINT "FK_67833219fdb7c9e45f4323e2663" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" ADD CONSTRAINT "FK_20de26d82edeb26a5e041a40918" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Chats" ADD CONSTRAINT "FK_4af252cd39d747308b42f3b1eb3" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Chats" ADD CONSTRAINT "FK_a3ef34f6e1de9dfe5af6cf66a25" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Chats" DROP CONSTRAINT "FK_a3ef34f6e1de9dfe5af6cf66a25"`);
        await queryRunner.query(`ALTER TABLE "Chats" DROP CONSTRAINT "FK_4af252cd39d747308b42f3b1eb3"`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" DROP CONSTRAINT "FK_20de26d82edeb26a5e041a40918"`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" DROP CONSTRAINT "FK_67833219fdb7c9e45f4323e2663"`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Chats" ADD CONSTRAINT "FK_a3ef34f6e1de9dfe5af6cf66a25" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Chats" ADD CONSTRAINT "FK_4af252cd39d747308b42f3b1eb3" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ProjectUsers" ADD CONSTRAINT "FK_20de26d82edeb26a5e041a40918" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
