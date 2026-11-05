import { version as uuidVersion } from "uuid";
import orchestrator from "../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/users/[username] by anonymous user", () => {
  test("With exact case match'", async () => {
    const response1 = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "MesmoCase",
        email: "mesmocase@gmail.com",
        password: "fabio123",
      }),
    });

    expect(response1.status).toBe(201);

    const response2 = await fetch(
      "http://localhost:3000/api/v1/users/MesmoCase",
    );

    expect(response2.status).toBe(200);

    const resposne2Body = await response2.json();

    expect(resposne2Body).toEqual({
      id: resposne2Body.id,
      username: "MesmoCase",
      email: "mesmocase@gmail.com",
      password: "fabio123",
      created_at: resposne2Body.created_at,
      updated_at: resposne2Body.updated_at,
    });

    expect(uuidVersion(resposne2Body.id)).toBe(4);
    expect(Date.parse(resposne2Body.created_at)).not.toBe(NaN);
    expect(Date.parse(resposne2Body.updated_at)).not.toBe(NaN);
  });
  test("With case mismatch'", async () => {
    const response1 = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "CaseDiferente",
        email: "casediferente@gmail.com",
        password: "fabio123",
      }),
    });

    expect(response1.status).toBe(201);

    const response2 = await fetch(
      "http://localhost:3000/api/v1/users/casediferente",
    );

    expect(response2.status).toBe(200);

    const resposne2Body = await response2.json();

    expect(resposne2Body).toEqual({
      id: resposne2Body.id,
      username: "CaseDiferente",
      email: "casediferente@gmail.com",
      password: "fabio123",
      created_at: resposne2Body.created_at,
      updated_at: resposne2Body.updated_at,
    });

    expect(uuidVersion(resposne2Body.id)).toBe(4);
    expect(Date.parse(resposne2Body.created_at)).not.toBe(NaN);
    expect(Date.parse(resposne2Body.updated_at)).not.toBe(NaN);
  });
  test("With not existent username'", async () => {
    const response = await fetch(
      "http://localhost:3000/api/v1/users/usuarioinexistente",
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
      status_code: 404,
    });
  });
});
