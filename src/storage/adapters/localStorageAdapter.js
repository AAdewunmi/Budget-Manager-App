/**
 * localStorage-backed persistence adapter.
 */
export class LocalStorageAdapter {
  readBucket(type) {
    try {
      const parsed = JSON.parse(localStorage.getItem(type) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to parse localStorage data:", error);
      return [];
    }
  }

  /**
   * Reads all transactions for a given type.
   */
  async getTransactionsByType(type) {
    return this.readBucket(type);
  }

  /**
   * Appends one transaction into its type-specific bucket.
   */
  async appendTransaction(transaction) {
    const data = this.readBucket(transaction.type);
    data.push(transaction);
    localStorage.setItem(transaction.type, JSON.stringify(data));
  }

  /**
   * Replaces an entire transaction bucket for a type.
   */
  async replaceTransactionsByType(type, transactions) {
    const safeData = Array.isArray(transactions) ? transactions : [];
    localStorage.setItem(type, JSON.stringify(safeData));
  }
}
