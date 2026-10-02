const { clearCache } = require("./cache");

function invalidateCache(req, res, next) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) clearCache();
    return originalJson(body);
  };

  return next();
}

module.exports = { invalidateCache };
