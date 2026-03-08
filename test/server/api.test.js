const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { loadFresh, clearModuleCache } = require("../helpers/moduleLoader");

const createTransaction = ({
  id,
  type = "INCOME",
  value = 100,
  description = "sample",
  timestamp = Date.now(),
} = {}) => ({ id, type, value, description, timestamp });

const createMockRes = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const findRouteHandler = (app, method, routePath) => {
  const layer = app.router.stack.find(
    (entry) =>
      entry.route
      && entry.route.path === routePath
      && entry.route.methods[method.toLowerCase()],
  );

  if (!layer) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${routePath}`);
  }

  return layer.route.stack[0].handle;
};

const findApiNotFoundHandler = (app) => {
  const layers = app.router.stack.filter((entry) => !entry.route);
  return layers[layers.length - 2].handle;
};

const findRouteNotFoundHandler = (app) => {
  const layers = app.router.stack.filter((entry) => !entry.route);
  return layers[layers.length - 1].handle;
};

const loadAppWithTempDb = () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "budget-api-test-"));
  process.env.BUDGET_DB_PATH = path.join(tempDir, "budget.sqlite");

  const { createApp } = loadFresh("server/index.js");
  const app = createApp({ port: 9999 });

  return { app, tempDir };
};

const cleanupLoadedApp = ({ tempDir }) => {
  const dbModulePath = path.resolve(__dirname, "..", "..", "server", "db.js");
  const cachedDbModule = require.cache[require.resolve(dbModulePath)];
  if (cachedDbModule && cachedDbModule.exports && typeof cachedDbModule.exports.closeDatabase === "function") {
    cachedDbModule.exports.closeDatabase();
  }
  clearModuleCache("server/db.js");
  clearModuleCache("server/index.js");
  delete process.env.BUDGET_DB_PATH;
  fs.rmSync(tempDir, { recursive: true, force: true });
};

test("API route handlers expose status and health payloads", () => {
  const ctx = loadAppWithTempDb();
  const rootHandler = findRouteHandler(ctx.app, "GET", "/");
  const apiHandler = findRouteHandler(ctx.app, "GET", "/api");
  const healthHandler = findRouteHandler(ctx.app, "GET", "/api/health");

  const rootRes = createMockRes();
  rootHandler({}, rootRes);
  assert.equal(rootRes.statusCode, 200);
  assert.equal(rootRes.body.status, "ok");
  assert.ok(Array.isArray(rootRes.body.endpoints));

  const apiRes = createMockRes();
  apiHandler({}, apiRes);
  assert.equal(apiRes.statusCode, 200);
  assert.equal(apiRes.body.service, "budget-manager-api");

  const healthRes = createMockRes();
  healthHandler({}, healthRes);
  assert.equal(healthRes.statusCode, 200);
  assert.match(healthRes.body.timestamp, /^\d{4}-\d{2}-\d{2}T/);

  cleanupLoadedApp(ctx);
});

test("API route handlers support transaction create/list/replace/migrate flows", () => {
  const ctx = loadAppWithTempDb();

  const createHandler = findRouteHandler(ctx.app, "POST", "/api/transactions");
  const listHandler = findRouteHandler(ctx.app, "GET", "/api/transactions");
  const replaceHandler = findRouteHandler(ctx.app, "PUT", "/api/transactions/:type");
  const migrateHandler = findRouteHandler(ctx.app, "POST", "/api/migrate/local-storage");

  const createRes = createMockRes();
  createHandler(
    {
      body: createTransaction({
        id: "api-income-1",
        type: "INCOME",
        value: 1400,
        description: "Salary",
        timestamp: 100,
      }),
    },
    createRes,
  );
  assert.equal(createRes.statusCode, 201);

  const listIncomeRes = createMockRes();
  listHandler({ query: { type: "INCOME" } }, listIncomeRes);
  assert.equal(listIncomeRes.statusCode, 200);
  assert.equal(listIncomeRes.body.length, 1);
  assert.equal(listIncomeRes.body[0].description, "Salary");

  const replaceRes = createMockRes();
  replaceHandler(
    {
      params: { type: "expenses" },
      body: [
        createTransaction({
          id: "api-expense-1",
          type: "EXPENSES",
          value: 500,
          description: "Rent",
          timestamp: 200,
        }),
      ],
    },
    replaceRes,
  );
  assert.equal(replaceRes.statusCode, 200);

  const listExpenseRes = createMockRes();
  listHandler({ query: { type: "EXPENSES" } }, listExpenseRes);
  assert.equal(listExpenseRes.statusCode, 200);
  assert.equal(listExpenseRes.body.length, 1);

  const migrateRes = createMockRes();
  migrateHandler(
    {
      body: {
        incomes: [
          createTransaction({
            id: "api-income-2",
            type: "INCOME",
            value: 300,
            description: "Bonus",
            timestamp: 300,
          }),
        ],
        expenses: [
          createTransaction({
            id: "api-expense-2",
            type: "EXPENSES",
            value: 50,
            description: "Transport",
            timestamp: 400,
          }),
        ],
      },
    },
    migrateRes,
  );
  assert.equal(migrateRes.statusCode, 201);

  const listIncomesAfterMigration = createMockRes();
  listHandler({ query: { type: "INCOME" } }, listIncomesAfterMigration);
  assert.equal(listIncomesAfterMigration.body.length, 2);

  cleanupLoadedApp(ctx);
});

test("API route handlers return expected errors for invalid inputs and 404s", () => {
  const ctx = loadAppWithTempDb();

  const listHandler = findRouteHandler(ctx.app, "GET", "/api/transactions");
  const createHandler = findRouteHandler(ctx.app, "POST", "/api/transactions");
  const apiNotFoundHandler = findApiNotFoundHandler(ctx.app);
  const routeNotFoundHandler = findRouteNotFoundHandler(ctx.app);

  const invalidTypeRes = createMockRes();
  listHandler({ query: { type: "OTHER" } }, invalidTypeRes);
  assert.equal(invalidTypeRes.statusCode, 400);
  assert.match(invalidTypeRes.body.message, /Invalid transaction type/);

  const invalidPayloadRes = createMockRes();
  createHandler(
    {
      body: { type: "INCOME", value: "abc" },
    },
    invalidPayloadRes,
  );
  assert.equal(invalidPayloadRes.statusCode, 400);
  assert.match(invalidPayloadRes.body.message, /Transaction id is required|numeric/);

  const api404Res = createMockRes();
  apiNotFoundHandler(
    {
      method: "GET",
      originalUrl: "/api/unknown",
    },
    api404Res,
  );
  assert.equal(api404Res.statusCode, 404);
  assert.equal(api404Res.body.status, "error");

  const route404Res = createMockRes();
  routeNotFoundHandler(
    {
      method: "GET",
      originalUrl: "/unknown",
    },
    route404Res,
  );
  assert.equal(route404Res.statusCode, 404);
  assert.equal(route404Res.body.status, "error");

  cleanupLoadedApp(ctx);
});
