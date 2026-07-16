import { join } from "node:path";
import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";

import controller from "infra/controller";
import database from "infra/database";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandlers);

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

async function getHandler(_, res) {
  const { defaultMigrationsOptions, dbClient } = await createDbClient();

  const pendingMigrations = await migrationRunner({
    ...defaultMigrationsOptions,
    dryRun: true,
  });

  await dbClient?.end();

  return res.status(200).json([pendingMigrations]);
}

async function postHandler(_, res) {
  const { defaultMigrationsOptions, dbClient } = await createDbClient();

  try {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return res.status(201).json([migratedMigrations]);
    }

    return res.status(200).json([migratedMigrations]);
  } finally {
    await dbClient?.end();
  }
}
