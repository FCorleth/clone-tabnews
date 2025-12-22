test("GET to /api/v1/migrations should return status 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
});
