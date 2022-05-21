import {MigrationInterface, QueryRunner} from "typeorm";

export class Articles1653153734264 implements MigrationInterface {
    name = 'Articles1653153734264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "article" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying, "body" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoriesList" text NOT NULL, "favoritesCount" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "article"`);
    }

}
