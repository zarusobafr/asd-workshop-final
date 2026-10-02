const productDatabase = require("../database/productDatabase");

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getAllProducts() {
  await wait(1500);
  return productDatabase.findAll();
}

async function getProductById(id) {
  await wait(1500);
  return productDatabase.findById(id);
}

function createProduct(product) {
  return productDatabase.create(product);
}

function updateProduct(id, changes) {
  return productDatabase.update(id, changes);
}

function deleteProduct(id) {
  return productDatabase.remove(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
