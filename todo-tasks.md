# Todo Tasks (WIP)

Note: I do not have network access to open the Udemy lecture URL. The list below is a production-grade budget app task plan based on common practices. If you want it aligned to that lecture, share the outline or key topics and I will tailor this file.

## Project planning
- Define MVP scope (income, expenses, categories, summaries)
- Write user stories and acceptance criteria
- Decide data model and naming conventions
- Choose app architecture (MVC/modules)

## UI/UX
- Create wireframes for main screens
- Build responsive layout
- Add accessible form controls and labels
- Design empty states and error states

## Frontend (HTML/CSS/JS)
- Build layout structure for dashboard
- Create forms for adding income/expense
- Add category management UI
- Implement transaction list with filters
- Add summary cards and charts

## Data model & state
- Define transaction schema
- Define category budget schema
- Create state management module
- Add validation utilities

## SQLite integration
- Decide runtime (Node + SQLite)
- Add SQLite dependency (e.g., better-sqlite3 or sqlite3)
- Create database schema and migrations
- Build data access layer (CRUD)
- Add seed data for development

## API layer (if using Node backend)
- Create REST endpoints for budgets, categories, transactions
- Add input validation and error handling
- Add pagination and sorting
- Add CORS configuration

## Persistence (if staying client-only)
- Add local storage cache
- Sync local state with SQLite (if using a local Node process)

## Testing
- Add unit tests for validators and calculations
- Add integration tests for data layer
- Add UI tests for critical flows
- Add linting/formatting checks

## Documentation
- Expand README with setup, usage, and scripts
- Document data model and API
- Add contribution guidelines
- Add changelog

## Quality & production readiness
- Add error logging
- Add loading states and toasts
- Harden form validation
- Optimize bundle size
- Audit accessibility

## Deployment
- Configure build scripts
- Add environment config
- Set up hosting (static + API if needed)

