const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { TRANSACTION_TYPES } = require("./constants");

const defaultDbPath = path.join(__dirname, "..", "data", "budget-manager.sqlite");
const dbPath = process.env.BUDGET_DB_PATH
  ? path.resolve(process.env.BUDGET_DB_PATH)
  : defaultDbPath;
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

const initDatabase = () => {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSES')),
      value REAL NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      timestamp INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_type_timestamp
      ON transactions(type, timestamp DESC);
  `);
};

const normalizeTransaction = (transaction) => ({
  id: String(transaction.id),
  type: String(transaction.type),
  value: Number(transaction.value),
  description: String(transaction.description || ""),
  timestamp: Number(transaction.timestamp || Date.now()),
});

const validateType = (type) => {
  if (type !== TRANSACTION_TYPES.INCOME && type !== TRANSACTION_TYPES.EXPENSES) {
    throw new Error("Invalid transaction type");
  }
};

const validateTransaction = (transaction) => {
  const normalized = normalizeTransaction(transaction);
  validateType(normalized.type);
  if (!normalized.id) throw new Error("Transaction id is required");
  if (!Number.isFinite(normalized.value)) throw new Error("Transaction value must be numeric");
  if (!Number.isFinite(normalized.timestamp)) {
    throw new Error("Transaction timestamp must be numeric");
  }
  return normalized;
};

const getTransactionsByType = (type) => {
  validateType(type);
  const statement = db.prepare(`
    SELECT id, type, value, description, timestamp
    FROM transactions
    WHERE type = ?
    ORDER BY timestamp DESC
  `);
  return statement.all(type);
};

const appendTransaction = (transaction) => {
  const normalized = validateTransaction(transaction);
  const statement = db.prepare(`
    INSERT OR REPLACE INTO transactions(id, type, value, description, timestamp)
    VALUES (@id, @type, @value, @description, @timestamp)
  `);
  statement.run(normalized);
};

const replaceTransactionsByType = (type, transactions) => {
  validateType(type);
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const normalizedList = safeTransactions.map((transaction) => {
    const normalized = validateTransaction(transaction);
    if (normalized.type !== type) {
      throw new Error(`Transaction type mismatch. Expected ${type}.`);
    }
    return normalized;
  });

  const deleteStatement = db.prepare("DELETE FROM transactions WHERE type = ?");
  const insertStatement = db.prepare(`
    INSERT OR REPLACE INTO transactions(id, type, value, description, timestamp)
    VALUES (@id, @type, @value, @description, @timestamp)
  `);

  const tx = db.transaction(() => {
    deleteStatement.run(type);
    normalizedList.forEach((transaction) => insertStatement.run(transaction));
  });
  tx();
};

const mergeLocalStorageData = ({ incomes = [], expenses = [] }) => {
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const statement = db.prepare(`
    INSERT OR IGNORE INTO transactions(id, type, value, description, timestamp)
    VALUES (@id, @type, @value, @description, @timestamp)
  `);
  const tx = db.transaction(() => {
    safeIncomes.forEach((transaction) => {
      const normalized = validateTransaction(transaction);
      if (normalized.type === TRANSACTION_TYPES.INCOME) {
        statement.run(normalized);
      }
    });
    safeExpenses.forEach((transaction) => {
      const normalized = validateTransaction(transaction);
      if (normalized.type === TRANSACTION_TYPES.EXPENSES) {
        statement.run(normalized);
      }
    });
  });
  tx();
};

const closeDatabase = () => {
  db.close();
};

module.exports = {
  initDatabase,
  getTransactionsByType,
  appendTransaction,
  replaceTransactionsByType,
  mergeLocalStorageData,
  closeDatabase,
};
