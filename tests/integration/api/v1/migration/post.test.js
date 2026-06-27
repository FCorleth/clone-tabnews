import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST to /api/v1/migraitons by anonymous user should running pending migrations", () => {
  test("for the first time", async () => {
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
  });

  test("for the second time", async () => {
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
});
