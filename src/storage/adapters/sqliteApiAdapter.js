/**
 * SQLite API-backed persistence adapter.
 * Expects a Node API server exposing /api routes.
 */
export class SQLiteApiAdapter {
  constructor({ baseUrl = "http://localhost:3001/api" } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) return undefined;
    return response.json().catch(() => undefined);
  }

  async getTransactionsByType(type) {
    const data = await this.request(`/transactions?type=${encodeURIComponent(type)}`);
    return Array.isArray(data) ? data : [];
  }

  async appendTransaction(transaction) {
    await this.request("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  }

  async replaceTransactionsByType(type, transactions) {
    const safeData = Array.isArray(transactions) ? transactions : [];
    await this.request(`/transactions/${encodeURIComponent(type)}`, {
      method: "PUT",
      body: JSON.stringify(safeData),
    });
  }

  async migrateFromLocalStorageData({ incomes = [], expenses = [] }) {
    await this.request("/migrate/local-storage", {
      method: "POST",
      body: JSON.stringify({ incomes, expenses }),
    });
  }
}
