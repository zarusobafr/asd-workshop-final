# Products API with TTL caching

This application implements the workshop requirements using the layered flow:

```text
Route → Middleware → Controller → Service → Database
```

## Structure

- `routes/` — Express route definitions
- `middleware/` — cache lookup/store and mutation invalidation
- `controllers/` — HTTP request/response handling
- `services/` — application logic and simulated slow reads
- `database/` — file-backed product persistence

## Endpoints

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`

## Caching behavior

- GET responses are cached by request URL.
- Each cache entry stores `{ value, createdAt }`.
- Entries expire after 60 seconds.
- `X-Cache: MISS` is returned for database reads and refreshed values.
- `X-Cache: HIT` is returned for fresh cached values.
- Successful POST, PUT, PATCH, and DELETE responses clear every product cache entry.

## Run

```bash
npm install
npm start
```

Run tests:

```bash
npm test
```
