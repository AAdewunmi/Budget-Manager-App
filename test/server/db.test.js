const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { loadFresh, clearModuleCache } = require("../helpers/moduleLoader");
const { TRANSACTION_TYPES } = require("../../server/constants");

const createTransaction = ({
  id,
  type = TRANSACTION_TYPES.INCOME,
  value = 100,
  description = "sample",
  timestamp = Date.now(),
} = {}) => ({ id, type, value, description, timestamp });

test("db module initializes and performs CRUD by type", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "budget-db-test-"));
  const dbPath = path.join(tempDir, "budget.sqlite");
  process.env.BUDGET_DB_PATH = dbPath;

  const dbModule = loadFresh("server/db.js");
  dbModule.initDatabase();

  const incomeTx = createTransaction({
    id: "income-1",
    type: TRANSACTION_TYPES.INCOME,
    value: 1500,
    description: "Salary",
    timestamp: 1000,
  });
  const expenseTx = createTransaction({
    id: "expense-1",
    type: TRANSACTION_TYPES.EXPENSES,
    value: 200,
    description: "Rent",
    timestamp: 2000,
  });

  dbModule.appendTransaction(incomeTx);
  dbModule.appendTransaction(expenseTx);

  const incomes = dbModule.getTransactionsByType(TRANSACTION_TYPES.INCOME);
  const expenses = dbModule.getTransactionsByType(TRANSACTION_TYPES.EXPENSES);

  assert.equal(incomes.length, 1);
  assert.equal(expenses.length, 1);
  assert.equal(incomes[0].description, "Salary");
  assert.equal(expenses[0].description, "Rent");

  dbModule.replaceTransactionsByType(TRANSACTION_TYPES.INCOME, [
    createTransaction({
      id: "income-2",
      type: TRANSACTION_TYPES.INCOME,
      value: 300,
      description: "Bonus",
      timestamp: 3000,
    }),
  ]);

  const replacedIncomes = dbModule.getTransactionsByType(TRANSACTION_TYPES.INCOME);
  assert.equal(replacedIncomes.length, 1);
  assert.equal(replacedIncomes[0].id, "income-2");

  dbModule.closeDatabase();
  clearModuleCache("server/db.js");
  delete process.env.BUDGET_DB_PATH;
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test("db module validates transaction type and shape", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "budget-db-test-"));
  const dbPath = path.join(tempDir, "budget.sqlite");
  process.env.BUDGET_DB_PATH = dbPath;

  const dbModule = loadFresh("server/db.js");
  dbModule.initDatabase();

  assert.throws(
    () => dbModule.getTransactionsByType("OTHER"),
    /Invalid transaction type/,
  );

  assert.throws(
    () =>
      dbModule.appendTransaction({
        id: "bad-1",
        type: TRANSACTION_TYPES.INCOME,
        value: "abc",
        description: "Bad",
        timestamp: Date.now(),
      }),
    /Transaction value must be numeric/,
  );

  assert.throws(
    () =>
      dbModule.replaceTransactionsByType(TRANSACTION_TYPES.INCOME, [
        createTransaction({ id: "mix-1", type: TRANSACTION_TYPES.EXPENSES }),
      ]),
    /Transaction type mismatch/,
  );

  dbModule.closeDatabase();
  clearModuleCache("server/db.js");
  delete process.env.BUDGET_DB_PATH;
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test("db module migration inserts only valid typed entries and ignores duplicates", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "budget-db-test-"));
  const dbPath = path.join(tempDir, "budget.sqlite");
  process.env.BUDGET_DB_PATH = dbPath;

  const dbModule = loadFresh("server/db.js");
  dbModule.initDatabase();

  const income = createTransaction({
    id: "mig-income-1",
    type: TRANSACTION_TYPES.INCOME,
    value: 500,
  });
  const expense = createTransaction({
    id: "mig-expense-1",
    type: TRANSACTION_TYPES.EXPENSES,
    value: 250,
  });

  dbModule.mergeLocalStorageData({
    incomes: [income, { ...income }],
    expenses: [expense, { ...expense }],
  });

  const incomes = dbModule.getTransactionsByType(TRANSACTION_TYPES.INCOME);
  const expenses = dbModule.getTransactionsByType(TRANSACTION_TYPES.EXPENSES);

  assert.equal(incomes.length, 1);
  assert.equal(expenses.length, 1);

  dbModule.closeDatabase();
  clearModuleCache("server/db.js");
  delete process.env.BUDGET_DB_PATH;
  fs.rmSync(tempDir, { recursive: true, force: true });
});
