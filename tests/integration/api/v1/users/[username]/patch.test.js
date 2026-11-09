import orchestrator from "../../orchestrator";
import user from "models/user";
import password from "models/password";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to /api/v1/users/[username]", () => {
  test("Update 'username' with correct credentials", async () => {
    await orchestrator.createUser({
      username: "fabio",
      email: "fabio@email.com",
      password: "fabio123",
    });

    const response = await orchestrator.updateUser("fabio", {
      username: "fabio2",
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "fabio2",
      email: "fabio@email.com",
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBeNaN();
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    expect(responseBody.updated_at > responseBody.created_at).toBe(true);
  });

  test("Update 'email' with correct credentials", async () => {
    await orchestrator.createUser({
      username: "fabio",
      email: "fabio5@email.com",
      password: "fabio123",
    });

    const response = await orchestrator.updateUser("fabio", {
      email: "fabio6@email.com",
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "fabio",
      email: "fabio6@email.com",
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBeNaN();
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    expect(responseBody.updated_at > responseBody.created_at).toBe(true);
  });

  test("Update 'password' with correct credentials", async () => {
    await orchestrator.createUser({
      username: "nova_senha",
      email: "nova_senha@email.com",
      password: "senha_antiga",
    });

    const response = await orchestrator.updateUser("nova_senha", {
      password: "senha_nova",
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "nova_senha",
      email: "nova_senha@email.com",
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBeNaN();
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    expect(responseBody.updated_at > responseBody.created_at).toBe(true);

    const userInDabatase = await user.findOneByUsername("nova_senha");
    const correctPasswordMatch = await password.compare(
      "senha_nova",
      userInDabatase.password,
    );

    expect(correctPasswordMatch).toBe(true);

    const incorrectPasswordMatch = await password.compare(
      "senha_antiga",
      userInDabatase.password,
    );

    expect(incorrectPasswordMatch).toBe(false);
  });

  test("Update 'username' with duplicated 'username'", async () => {
    await orchestrator.createUser({
      username: "username1",
    });
    await orchestrator.createUser({
      username: "username2",
    });

    const response = await orchestrator.updateUser("username2", {
      username: "username1",
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

  test("Update 'email' with duplicated 'email'", async () => {
    await orchestrator.createUser({
      email: "email_existente@email.com",
    });
    const secondUser = await orchestrator.createUser({
      email: "email_existente2@email.com",
    });

    const response = await orchestrator.updateUser(secondUser.username, {
      email: "email_existente@email.com",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      name: "ValidationError",
      message: "Email informado já está sendo utilizado.",
      action: "Utilize outro email para esta operação.",
      status_code: 400,
    });
  });

  test("Update 'username' with non-existent 'username'", async () => {
    const response = await orchestrator.updateUser("username_nao_existente", {
      username: "username1",
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      name: "NotFoundError",
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
      status_code: 404,
    });
  });
});
