# SysDesign Studio

Local app for practicing system design interviews. Design docs are in `docs/`.

Prototype status: only the Home / Problems page is built (`GET /api/health`, `GET /api/problems`).

## Run with Docker

```sh
docker compose up -d --build     # or: docker-compose up -d --build
```

Open http://localhost:3001. Data is stored in the `sds-data` volume. The port is published on 127.0.0.1 only. Keep the host and container ports the same, because the server's Host/Origin allowlist is derived from `PORT`.

## Develop locally

Requires Node 22+.

```sh
npm install
npm run dev        # API on :3001, Vite UI on http://localhost:5173 (proxies /api)
npm test           # server + client tests
npm run typecheck
npm run build && NODE_ENV=production npm start   # single process on :3001
```

## Layout

- `shared/`: Zod schemas, types and the error table used by both sides
- `server/`: Express API (SQLite via better-sqlite3); serves the built UI in production
- `client/`: React + Vite UI
