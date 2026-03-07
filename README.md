# Budget Manager Application

## Overview
Budget Manager is a web app for tracking income and expenses, viewing running balance, and sorting transactions by date or amount.

The app now persists data in **SQLite** through a Node/Express API layer.

## Architecture
- Frontend (browser app) runs with Parcel and renders UI.
- API server handles persistence and validation.
- SQLite stores transactions in `data/budget-manager.sqlite`.

## Why both `1234` and `3001` exist
- `http://localhost:1234` is the **frontend app** (Parcel dev server).
- `http://localhost:3001` is the **backend API** (Express + SQLite).

The frontend calls API routes under `http://localhost:3001/api`.

## LocalStorage to SQLite migration
On first startup with the SQLite API provider enabled:
- The frontend checks old `localStorage` keys (`INCOME`, `EXPENSES`).
- It posts any legacy records to the API migration endpoint.
- It sets a one-time flag in `localStorage`: `budget_sqlite_migration_v1_done`.

## Run locally
1. Install dependencies:
```bash
npm install
```
2. Start API and frontend:
```bash
npm run api & npm start
```

## API endpoints

### Status and discovery
- `GET /`  
Returns service status plus app/API URLs.

- `GET /api`  
Returns API status and route index.

- `GET /api/health`  
Returns health payload and timestamp.

### Transactions
- `GET /api/transactions?type=INCOME`
- `GET /api/transactions?type=EXPENSES`  
Returns all transactions for the requested type.

- `POST /api/transactions`  
Creates (upserts by `id`) a single transaction.

- `PUT /api/transactions/:type` (`:type` = `INCOME` or `EXPENSES`)  
Replaces all transactions for a given type.

### Migration
- `POST /api/migrate/local-storage`  
Body:
```json
{
  "incomes": [],
  "expenses": []
}
```
Merges legacy browser records into SQLite (insert-ignore by `id`).

## Tech stack
- Frontend: HTML, CSS, JavaScript (ES modules)
- Dev server/bundler: Parcel (`parcel-bundler`)
- Backend: Node.js + Express
- Database: SQLite (`better-sqlite3`)
- API middleware: `cors`, `express.json`
