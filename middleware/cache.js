const TTL_MS = 60 * 1000;
const cacheStore = new Map();

function cacheKey(req) {
  return req.originalUrl;
}

function cache(req, res, next) {
  if (req.method !== "GET" || !req.path.startsWith("/products")) return next();

  const key = cacheKey(req);
  const entry = cacheStore.get(key);
  const now = Date.now();

  if (entry && now - entry.createdAt < TTL_MS) {
    res.set("X-Cache", "HIT");
    return res.json(entry.value);
  }

  if (entry) cacheStore.delete(key);
  res.set("X-Cache", "MISS");

  const originalJson = res.json.bind(res);
  res.json = (value) => {
    cacheStore.set(key, { value, createdAt: Date.now() });
    return originalJson(value);
  };

  return next();
}

function clearCache() {
  cacheStore.clear();
}

function getCacheStore() {
  return cacheStore;
}

module.exports = { TTL_MS, cache, clearCache, getCacheStore };
