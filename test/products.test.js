const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const path = require("path");
const request = require("supertest");
const app = require("../app");
const { clearCache, getCacheStore, TTL_MS } = require("../middleware/cache");

const databaseFile = path.join(__dirname, "..", "database", "db.json");
const initialProducts = [
  { id: 1, name: "Keyboard", price: 49.99 },
  { id: 2, name: "Mouse", price: 19.99 },
  { id: 3, name: "Monitor", price: 199 },
  { id: 4, name: "Mouse", price: 19 },
];

async function resetDatabase() {
  await fs.writeFile(databaseFile, `${JSON.stringify(initialProducts, null, 2)}\n`);
  clearCache();
}

test.beforeEach(resetDatabase);

test("GET /products returns MISS, then HIT", async () => {
  const first = await request(app).get("/products");
  assert.equal(first.status, 200);
  assert.equal(first.headers["x-cache"], "MISS");

  const second = await request(app).get("/products");
  assert.equal(second.status, 200);
  assert.equal(second.headers["x-cache"], "HIT");
  assert.deepEqual(second.body, first.body);
});

test("GET /products/:id caches independently", async () => {
  const first = await request(app).get("/products/1");
  assert.equal(first.headers["x-cache"], "MISS");
  assert.equal(first.body.id, 1);

  const second = await request(app).get("/products/1");
  assert.equal(second.headers["x-cache"], "HIT");
});

test("expired entries are ignored and refreshed", async () => {
  await request(app).get("/products");
  const entry = getCacheStore().get("/products");
  entry.createdAt = Date.now() - TTL_MS - 1;

  const response = await request(app).get("/products");
  assert.equal(response.headers["x-cache"], "MISS");
  assert.ok(getCacheStore().get("/products").createdAt > Date.now() - 1000);
});

test("successful mutations invalidate all product caches", async () => {
  await request(app).get("/products");
  await request(app).get("/products/1");
  assert.equal(getCacheStore().size, 2);

  const response = await request(app).patch("/products/1").send({ price: 59.99 });
  assert.equal(response.status, 200);
  assert.equal(getCacheStore().size, 0);

  const refreshed = await request(app).get("/products");
  assert.equal(refreshed.headers["x-cache"], "MISS");
  assert.equal(refreshed.body.find((product) => product.id === 1).price, 59.99);
});

test("POST, PUT, and DELETE modify stored data", async () => {
  const created = await request(app).post("/products").send({ name: "Monitor", price: 199 });
  assert.equal(created.status, 201);

  const updated = await request(app).put(`/products/${created.body.id}`).send({ price: 189 });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.price, 189);

  const deleted = await request(app).delete(`/products/${created.body.id}`);
  assert.equal(deleted.status, 204);

  const missing = await request(app).get(`/products/${created.body.id}`);
  assert.equal(missing.status, 404);
});
