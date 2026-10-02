const productService = require("../services/productService");

function parseId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error("Product id must be a positive integer");
    error.status = 400;
    throw error;
  }
  return id;
}

async function getAll(req, res, next) {
  try {
    res.json(await productService.getAllProducts());
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const product = await productService.getProductById(parseId(req));
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const product = await productService.updateProduct(parseId(req), req.body);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await productService.deleteProduct(parseId(req));
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
