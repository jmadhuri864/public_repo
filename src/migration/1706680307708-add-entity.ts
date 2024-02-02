import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntity1706680307708 implements MigrationInterface {
    name = 'AddEntity1706680307708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "userprofile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image" character varying NOT NULL DEFAULT 'default-post.png', "fullName" character varying NOT NULL, "nickname" character varying NOT NULL, "dateOfBirth" date NOT NULL, "email" character varying NOT NULL, "mobileNumber" character varying NOT NULL, "gender" character varying NOT NULL, "userId" uuid, CONSTRAINT "UQ_b5d6ca99644bc72dbf81b5ef9a6" UNIQUE ("email"), CONSTRAINT "REL_fc505bba393243cf1910fca131" UNIQUE ("userId"), CONSTRAINT "PK_7611eb6ce0cfd2de134000d0b8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "password" character varying NOT NULL, "userprofileId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_e30dae517c7aacc1b8f9b6a604" UNIQUE ("userprofileId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "email_index" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "userprofile" ADD CONSTRAINT "FK_fc505bba393243cf1910fca131d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_e30dae517c7aacc1b8f9b6a6043" FOREIGN KEY ("userprofileId") REFERENCES "userprofile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_e30dae517c7aacc1b8f9b6a6043"`);
        await queryRunner.query(`ALTER TABLE "userprofile" DROP CONSTRAINT "FK_fc505bba393243cf1910fca131d"`);
        await queryRunner.query(`DROP INDEX "public"."email_index"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "userprofile"`);
    }

}
