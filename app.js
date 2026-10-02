const express = require("express");
const productRoutes = require("./routes/productRoutes");
const { cache } = require("./middleware/cache");
const { invalidateCache } = require("./middleware/invalidateCache");

const app = express();

app.use(express.json());
app.use(cache);
app.use(invalidateCache);
app.use("/products", productRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
