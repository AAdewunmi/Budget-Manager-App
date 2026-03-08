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

const defaultPort = Number(process.env.PORT || 3001);

const listEndpoints = () => ([
  { method: "GET", path: "/api", description: "API status and route index" },
  { method: "GET", path: "/api/health", description: "Health check" },
  {
    method: "GET",
    path: "/api/transactions?type=INCOME|EXPENSES",
    description: "Fetch transactions by type",
  },
  { method: "POST", path: "/api/transactions", description: "Create transaction" },
  {
    method: "PUT",
    path: "/api/transactions/:type",
    description: "Replace all transactions for INCOME or EXPENSES",
  },
  {
    method: "POST",
    path: "/api/migrate/local-storage",
    description: "One-time migration payload from browser localStorage",
  },
]);

const createApp = ({ port = defaultPort } = {}) => {
  initDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req, res) => {
    res.json({
      status: "ok",
      service: "budget-manager-api",
      message: "API server is running",
      appUrl: "http://localhost:1234",
      apiBaseUrl: `http://localhost:${port}/api`,
      endpoints: listEndpoints(),
    });
  });

  app.get("/api", (_req, res) => {
    res.json({
      status: "ok",
      service: "budget-manager-api",
      message: "Use one of the endpoints below",
      endpoints: listEndpoints(),
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "budget-manager-api",
      timestamp: new Date().toISOString(),
    });
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

  app.use("/api", (req, res) => {
    res.status(404).json({
      status: "error",
      message: `No endpoint for ${req.method} ${req.originalUrl}`,
      apiBaseUrl: `http://localhost:${port}/api`,
      endpoints: listEndpoints(),
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      status: "error",
      message: `No route for ${req.method} ${req.originalUrl}`,
      appUrl: "http://localhost:1234",
      apiBaseUrl: `http://localhost:${port}/api`,
    });
  });

  return app;
};

const startServer = ({ port = defaultPort } = {}) => {
  const app = createApp({ port });
  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Budget API running on http://localhost:${port}`);
    console.log(`Types: ${TRANSACTION_TYPES.INCOME}, ${TRANSACTION_TYPES.EXPENSES}`);
  });
};

if (require.main === module) {
  startServer({ port: defaultPort });
}

module.exports = {
  createApp,
  listEndpoints,
  startServer,
};
