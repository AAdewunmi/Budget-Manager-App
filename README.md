# Budget Manager App

A full-stack personal finance tracker for managing income and expenses, calculating live balance, and maintaining transaction history with persistent storage.

## Project Status
**Completed** - Final project release.

This repository is feature-complete for the current scope and includes:
- Frontend transaction management UI
- Node/Express API backend
- SQLite persistence
- Automated backend test suite

## Key Features
- Add income and expense transactions with description and amount
- Live balance calculation (`income - expenses`)
- Filter/sort transactions by:
  - Date
  - Increasing amount
  - Decreasing amount
- Swap transactions between Income and Expenses directly from list cards
- Reset dashboard data with confirmation flow
- Legacy localStorage to SQLite migration path

## Screenshots

### Empty / Initial State
<img width="1439" height="901" alt="Image" src="https://github.com/user-attachments/assets/00e4ee19-2901-4e52-af23-f88094e03a65" />

### Populated State (with Swap Actions)
<img width="1438" height="900" alt="Image" src="https://github.com/user-attachments/assets/253bd188-bc63-46b2-b1b3-0fd47db27e16" />

## Architecture
- **Frontend**: Vanilla JavaScript (ES modules), HTML, CSS
- **Bundler/Dev Server**: Parcel
- **Backend**: Node.js + Express
- **Database**: SQLite (`better-sqlite3`)
- **API Base URL**: `http://localhost:3001/api`
- **Default Frontend URL**: `http://localhost:1234`

## Quick Start
For full setup and operational instructions, see:

- [RUNBOOK.md](./RUNBOOK.md)

Minimal start commands:

```bash
npm install
npm run api
npm start
```

## Testing
Run the automated test suite:

```bash
npm test
```

Current suite covers:
- DB validation and CRUD behavior
- Migration logic
- API route handler success/error flows

## API Summary
Core endpoints:
- `GET /api`
- `GET /api/health`
- `GET /api/transactions?type=INCOME|EXPENSES`
- `POST /api/transactions`
- `PUT /api/transactions/:type`
- `POST /api/migrate/local-storage`

## Repository Structure
- `src/` - Frontend application logic and views
- `server/` - Express API and SQLite data access
- `data/` - SQLite database files (runtime)
- `test/` - Automated tests
- `RUNBOOK.md` - Operational guide (run/test/troubleshooting)

## License
LICENSE
