import database from "infra/database";
import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices;
  await database.query("drop schema public cascade; create schema public;");
});

describe("GET to /api/v1/migraitons by anonymous user", () => {
  test("should unning pending migrations", async () => {
    const response = await fetch("http://localhost:3000/api/v1/migrations");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});
