import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogTable1748077925223 implements MigrationInterface {
  name = 'CreateAuditLogTable1748077925223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."audit_log_action_enum" AS ENUM('LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'EMAIL_CHANGE', 'PROFILE_UPDATE', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'FILE_UPLOAD', 'FILE_DELETE', 'ROLE_CHANGE', 'STATUS_CHANGE', 'SESSION_CREATE', 'SESSION_DELETE', 'ACCESS_DENIED', 'API_ACCESS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" "public"."audit_log_action_enum" NOT NULL, "description" character varying NOT NULL, "ipAddress" character varying NOT NULL, "userAgent" character varying, "endpoint" character varying, "method" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d1f43483b2c58d5a55f6a2f5ab" ON "audit_log" ("ipAddress") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_951e6339a77994dfbad976b35c" ON "audit_log" ("action") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_78e013ffae12f5a1fc1dbefff9" ON "audit_log" ("createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_log" ADD CONSTRAINT "FK_2621409ebc295c5da7ff3e41396" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_log" DROP CONSTRAINT "FK_2621409ebc295c5da7ff3e41396"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_78e013ffae12f5a1fc1dbefff9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_951e6339a77994dfbad976b35c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d1f43483b2c58d5a55f6a2f5ab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d1f43483b2c58d5a55f6a2f5ab"`,
    );
    await queryRunner.query(`DROP TABLE "audit_log"`);
    await queryRunner.query(`DROP TYPE "public"."audit_log_action_enum"`);
  }
}
