import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateDataToUuid1748074944071 implements MigrationInterface {
  name = 'MigrateDataToUuid1748074944071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing roles to use UUIDs from enum
    await queryRunner.query(`
      UPDATE "role" SET "id" = '11111111-1111-1111-1111-111111111111' WHERE "name" = 'Admin'
    `);
    await queryRunner.query(`
      UPDATE "role" SET "id" = '22222222-2222-2222-2222-222222222222' WHERE "name" = 'User'
    `);

    // Update existing statuses to use UUIDs from enum
    await queryRunner.query(`
      UPDATE "status" SET "id" = '33333333-3333-3333-3333-333333333333' WHERE "name" = 'Active'
    `);
    await queryRunner.query(`
      UPDATE "status" SET "id" = '44444444-4444-4444-4444-444444444444' WHERE "name" = 'Inactive'
    `);

    // Update user foreign keys to reference the new UUIDs
    await queryRunner.query(`
      UPDATE "user" SET "roleId" = '11111111-1111-1111-1111-111111111111' 
      WHERE "roleId" IN (SELECT "id" FROM "role" WHERE "name" = 'Admin')
    `);
    await queryRunner.query(`
      UPDATE "user" SET "roleId" = '22222222-2222-2222-2222-222222222222' 
      WHERE "roleId" IN (SELECT "id" FROM "role" WHERE "name" = 'User')
    `);

    await queryRunner.query(`
      UPDATE "user" SET "statusId" = '33333333-3333-3333-3333-333333333333' 
      WHERE "statusId" IN (SELECT "id" FROM "status" WHERE "name" = 'Active')
    `);
    await queryRunner.query(`
      UPDATE "user" SET "statusId" = '44444444-4444-4444-4444-444444444444' 
      WHERE "statusId" IN (SELECT "id" FROM "status" WHERE "name" = 'Inactive')
    `);
  }

  public down(): Promise<void> {
    // This migration is not easily reversible since we're changing UUIDs to specific values
    // The previous migration handles the schema rollback
    console.log(
      'Data migration rollback not implemented - use schema migration rollback',
    );
    return Promise.resolve();
  }
}
