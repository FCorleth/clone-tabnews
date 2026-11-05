import { version as uuidVersion } from "uuid";

import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/users by anonymous user", () => {
  test("With unique and valid data", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "fabiocorleth",
        email: "fabiocorleth@gmail.com",
        password: "fabio123",
      }),
    });

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "fabiocorleth",
      email: "fabiocorleth@gmail.com",
      password: "fabio123",
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
    expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);
  });
  test("With duplicated 'email'", async () => {
    const response1 = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "emailduplicado1",
        email: "emailduplicado@gmail.com",
        password: "fabio123",
      }),
    });

    expect(response1.status).toBe(201);

    const response2 = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "emailduplicado2",
        email: "Emailduplicado@gmail.com",
        password: "fabio123",
      }),
    });

    expect(response2.status).toBe(400);

    const response2Body = await response2.json();

    expect(response2Body).toEqual({
      name: "ValidationError",
      message: "Email informado já está sendo utilizado",
      action: "Utilize outro email para realizar o cadastro",
      status_code: 400,
    });
  });
});
