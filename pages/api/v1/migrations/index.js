import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const method = request.method;
  const dbClient = await database.getNewClient();

  const defaultMigrationsOptions = {
    dbClient: dbClient,
    dir: join("infra", "migrations"),
    direction: "up",
    noLock: true,
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  try {
    if (method === "GET") {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: true,
      });
      await dbClient.end();
      return response.status(200).json([pendingMigrations]);
    }

    if (method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: false,
      });

      await dbClient.end();

      if (migratedMigrations.length > 0) {
        return response.status(201).json([migratedMigrations]);
      }

      return response.status(200).json([migratedMigrations]);
    }
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: error.message });
  }
}
