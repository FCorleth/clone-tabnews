import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  const method = request.method;

  try {
    const migrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: method === "GET" ? true : false,
      dir: join("infra", "migrations"),
      direction: "up",
      noLock: true,
      verbose: true,
      migrationsTable: "pgmigrations",
    });
    response.status(200).json([migrations]);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: error.message });
  }
}
