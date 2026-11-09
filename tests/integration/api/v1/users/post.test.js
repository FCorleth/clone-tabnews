import { version as uuidVersion } from "uuid";

import user from "models/user";
import password from "models/password";
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
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
    expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

    const userInDabatase = await user.findOneByUsername("fabiocorleth");
    const correctPasswordMatch = await password.compare(
      "fabio123",
      userInDabatase.password,
    );

    expect(correctPasswordMatch).toBe(true);

    const incorrectPasswordMatch = await password.compare(
      "senhaerrada",
      userInDabatase.password,
    );

    expect(incorrectPasswordMatch).toBe(false);
  });
  test("With duplicated 'email'", async () => {
    const firstUser = await orchestrator.createUser({});

    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "emailduplicado2",
        email: firstUser.email,
        password: "fabio123",
      }),
    });

    expect(response.status).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "ValidationError",
      message: "Email informado já está sendo utilizado.",
      action: "Utilize outro email para esta operação.",
      status_code: 400,
    });
  });
  test("With duplicated 'username'", async () => {
    const firstUser = await orchestrator.createUser({});

    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: firstUser.username,
        email: "teste_email_2@email.com",
        password: "teste123",
      }),
    });

    expect(response.status).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "ValidationError",
      message: "Username informado já está sendo utilizado.",
      action: "Utilize outro username para esta operação.",
      status_code: 400,
    });
  });
});
