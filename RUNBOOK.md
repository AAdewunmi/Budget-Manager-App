# Runbook

## Overview
This project is a Budget Manager app with:
- Frontend served by Parcel (`index.html`)
- Backend API served by Express + SQLite (`server/index.js`)
- Automated tests using Node's built-in test runner (`node:test`)

## Prerequisites
- Node.js 18+ (Node 24 is currently used in this repo)
- npm
- macOS/Linux/Windows terminal

Check versions:

```bash
node -v
npm -v
```

## Install dependencies
From project root:

```bash
npm install
```

## Run the app locally
Open two terminals in the project root.

### Terminal 1: Start API server

```bash
npm run api
```

Expected output includes:
- `Budget API running on http://localhost:3001`

### Terminal 2: Start frontend dev server

```bash
npm start
```

Parcel serves the app at:
- `http://localhost:1234`

Open this URL in your browser.

## How the app is wired
- Frontend uses `SQLiteApiAdapter` by default in `src/controller.js`
- API base URL is `http://localhost:3001/api`
- SQLite database file is stored at `data/budget-manager.sqlite` by default

Optional override for DB path:

```bash
BUDGET_DB_PATH=/tmp/budget-manager.sqlite npm run api
```

## Run tests

```bash
npm test
```

Current test command:
- `node --test --test-concurrency=1 test/**/*.test.js`

Test coverage includes:
- Server constants validation
- Database CRUD/validation/migration logic
- API route handler behavior (success + error cases)

## Lint/format
No dedicated lint or format script is currently configured in `package.json`.

## Common troubleshooting

### `npm test` fails with DB/file lock issues
- Ensure no other process is using the same SQLite DB.
- Re-run tests; test suite uses temp DB paths for isolation.

### Frontend loads but requests fail
- Confirm API is running on port `3001`.
- Check browser devtools network tab for `/api/*` errors.

### Port already in use
Use a different API port:

```bash
PORT=3002 npm run api
```

If you change API port, also update frontend adapter config in `src/controller.js`.

### Git push issues
If push fails over HTTPS, verify credentials/token and consider switching to SSH remote.

## Project scripts
From `package.json`:

- `npm start` -> `parcel index.html`
- `npm run api` -> `node server/index.js`
- `npm test` -> `node --test --test-concurrency=1 test/**/*.test.js`
