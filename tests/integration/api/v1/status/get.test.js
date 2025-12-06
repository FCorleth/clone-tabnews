test("GET to /api/v1/status should return status 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");

  expect(response.status).toBe(200);

  const body = await response.json();
  expect(body.updated_at).toBeDefined();

  expect(body.dependencies.database.version).toBeDefined();
  expect(body.dependencies.database.version).toBe("16.0");

  expect(body.dependencies.database.max_connections).toBe(100);
  expect(body.dependencies.database.max_connections).toBeDefined();

  expect(body.dependencies.database.active_connections).toEqual(1);
  expect(body.dependencies.database.active_connections).toBeDefined();

  const parseUpdatedAt = new Date(body.updated_at).toISOString();
  expect(body.updated_at).toEqual(parseUpdatedAt);
});
