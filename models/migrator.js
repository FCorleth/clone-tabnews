import { join } from "node:path";
import database from "infra/database";
import migrationRunner from "node-pg-migrate";

import { ServiceError } from "infra/errors";

async function createDbClient() {
  const dbClient = await database.getNewClient();

  const defaultMigrationsOptions = {
    dbClient: dbClient,
    dir: join("infra", "migrations"),
    direction: "up",
    noLock: true,
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  return { defaultMigrationsOptions, dbClient };
}

async function listPendingMigrations() {
  const { defaultMigrationsOptions, dbClient } = await createDbClient();

  try {
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: true,
    });

    return pendingMigrations;
  } catch (error) {
    const publicObjectError = new ServiceError({ cause: error });
    console.error(publicObjectError);
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  const { defaultMigrationsOptions, dbClient } = await createDbClient();

  try {
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
    });

    return pendingMigrations;
  } catch (error) {
    const publicObjectError = new ServiceError({ cause: error });
    console.error(publicObjectError);
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
