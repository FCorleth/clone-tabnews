import { createRouter } from "next-connect";
import migrator from "models/migrator";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const pendingMigrations = await migrator.listPendingMigrations(req.method);
  return res.status(200).json([pendingMigrations]);
}

async function postHandler(req, res) {
  const migratedMigrations = await migrator.runPendingMigrations(req.method);

  if (migratedMigrations.length > 0) {
    return res.status(201).json([migratedMigrations]);
  }

  return res.status(200).json([migratedMigrations]);
}
