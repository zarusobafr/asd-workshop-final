const fs = require("fs/promises");
const path = require("path");

const pathToFile = path.join(__dirname, "db.json");

async function readProducts() {
  const data = await fs.readFile(pathToFile, "utf-8");
  return JSON.parse(data);
}

async function writeProducts(products) {
  await fs.writeFile(pathToFile, `${JSON.stringify(products, null, 2)}\n`, "utf-8");
  return products;
}

async function findAll() {
  return readProducts();
}

async function findById(id) {
  const products = await readProducts();
  return products.find((product) => product.id === id) || null;
}

async function create(product) {
  const products = await readProducts();
  const nextId = products.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const newProduct = { id: nextId, ...product };
  await writeProducts([...products, newProduct]);
  return newProduct;
}

async function update(id, changes) {
  const products = await readProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return null;

  const updatedProduct = { ...products[index], ...changes, id };
  products[index] = updatedProduct;
  await writeProducts(products);
  return updatedProduct;
}

async function remove(id) {
  const products = await readProducts();
  const remaining = products.filter((product) => product.id !== id);
  if (remaining.length === products.length) return null;

  await writeProducts(remaining);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
