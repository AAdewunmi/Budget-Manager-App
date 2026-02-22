/**
 * IndexedDB-backed persistence adapter.
 * This uses the same public methods as LocalStorageAdapter for drop-in swapping.
 */
export class IndexedDBAdapter {
  constructor({ dbName = "budget-manager-db", storeName = "transactions" } = {}) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.dbPromise = null;
  }

  openDb() {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        let store;
        if (!db.objectStoreNames.contains(this.storeName)) {
          store = db.createObjectStore(this.storeName, { keyPath: "id" });
        } else {
          store = request.transaction.objectStore(this.storeName);
        }
        if (!store.indexNames.contains("type")) {
          store.createIndex("type", "type", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  runTransaction(mode, operation) {
    return this.openDb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(this.storeName, mode);
          const store = tx.objectStore(this.storeName);

          let operationResult;
          try {
            operationResult = operation(store, tx);
          } catch (error) {
            reject(error);
            return;
          }

          tx.oncomplete = () => resolve(operationResult);
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
        }),
    );
  }

  /**
   * Reads all transactions for a given type.
   */
  async getTransactionsByType(type) {
    return this.runTransaction("readonly", (store) => {
      const index = store.index("type");
      return new Promise((resolve, reject) => {
        const request = index.getAll(type);
        request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
        request.onerror = () => reject(request.error);
      });
    }).then((resultPromise) => resultPromise);
  }

  /**
   * Appends one transaction.
   */
  async appendTransaction(transaction) {
    return this.runTransaction("readwrite", (store) => {
      store.put(transaction);
      return undefined;
    });
  }

  /**
   * Replaces all transactions for a type.
   */
  async replaceTransactionsByType(type, transactions) {
    const safeData = Array.isArray(transactions) ? transactions : [];
    return this.runTransaction("readwrite", (store) => {
      const index = store.index("type");
      return new Promise((resolve, reject) => {
        const deleteRequest = index.openKeyCursor(type);
        deleteRequest.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
            return;
          }

          safeData.forEach((transaction) => store.put(transaction));
          resolve();
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      });
    }).then((resultPromise) => resultPromise);
  }
}
