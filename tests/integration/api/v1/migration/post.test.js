import database from "infra/database";
import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices;
  await database.query("drop schema public cascade; create schema public;");
});

test("POST in /api/v1/migraitons should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(201);

  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);

  const insideBody = body[0][0];
  expect(insideBody.name).toBeDefined();
  expect(insideBody.timestamp).toBeDefined();
  expect(insideBody.path).toBeDefined();
  expect(insideBody.path).toMatch(/infra.migrations/);

  const secondResponse = await fetch(
    "http://localhost:3000/api/v1/migrations",
    {
      method: "POST",
    },
  );
  expect(secondResponse.status).toBe(200);

  const secondResponseBody = await secondResponse.json();
  expect(Array.isArray(secondResponseBody)).toBe(true);
});
