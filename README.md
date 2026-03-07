Budget Manager Application

Overview
This app tracks income and expenses with sortable transaction lists and live balance updates.

Storage migration
The app now uses SQLite through a small Node API server.
On first startup with the API enabled, legacy browser `localStorage` records are migrated into SQLite.

Run locally
1. Install dependencies: `npm install`
2. Start SQLite API server: `npm run api`
3. Start frontend dev server: `npm start`

By default, the frontend expects the API at `http://localhost:3001/api`.

Tech stack
- HTML, CSS, JavaScript (frontend)
- Parcel (frontend dev server)
- Node.js + Express (API)
- SQLite via `better-sqlite3`
