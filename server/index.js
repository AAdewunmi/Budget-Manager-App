const express = require("express");
const cors = require("cors");
const {
  initDatabase,
  getTransactionsByType,
  appendTransaction,
  replaceTransactionsByType,
  mergeLocalStorageData,
} = require("./db");
const { TRANSACTION_TYPES } = require("./constants");

const app = express();
const port = Number(process.env.PORT || 3001);

initDatabase();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/transactions", (req, res) => {
  try {
    const type = String(req.query.type || "");
    const data = getTransactionsByType(type);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/transactions", (req, res) => {
  try {
    appendTransaction(req.body);
    res.status(201).json({ message: "Created" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/transactions/:type", (req, res) => {
  try {
    const type = String(req.params.type || "");
    const safeType = type.toUpperCase();
    const data = Array.isArray(req.body) ? req.body : [];
    replaceTransactionsByType(safeType, data);
    res.json({ message: "Replaced" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/migrate/local-storage", (req, res) => {
  try {
    mergeLocalStorageData({
      incomes: req.body?.incomes,
      expenses: req.body?.expenses,
    });
    res.status(201).json({ message: "Migrated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Budget API running on http://localhost:${port}`);
  console.log(`Types: ${TRANSACTION_TYPES.INCOME}, ${TRANSACTION_TYPES.EXPENSES}`);
});
