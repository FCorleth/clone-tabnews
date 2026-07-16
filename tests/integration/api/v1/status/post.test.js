import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST to /api/v1/status by anonymous user", () => {
  test("should retrieving current system status", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status", {
      method: "POST",
    });

    expect(response.status).toBe(405);

    const body = await response.json();

    expect(body).toEqual({
      name: "MethodNotAllowedError",
      message: "Method not allowed for this endpoint",
      action: "Verify if the method http is valid for this endpoint",
      status_code: 405,
    });
  });
});
