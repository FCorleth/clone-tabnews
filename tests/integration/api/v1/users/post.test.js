import orchestrator from "../orchestrator";
import database from "infra/database";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/users by anonymous user", () => {
  test("With unique and valid data", async () => {
    await database.query({
      text: `INSERT INTO
                users (username, email, password)
            VALUES
                ($1, $2, $3);`,
      values: ["fabiocorleth", "fabiocorleth@gmail.com", "fabio123"],
    });

    const users = await database.query("SELECT * FROM users;");
    console.log(users.rows);

    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
    });

    expect(response.status).toBe(201);
  });
});
