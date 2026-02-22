import { IndexedDBAdapter } from "./adapters/indexedDBAdapter";
import { LocalStorageAdapter } from "./adapters/localStorageAdapter";

/**
 * Central storage module used by the app.
 * Switch providers by calling useIndexedDBAdapter() or useLocalStorageAdapter().
 */
let activeAdapter = new LocalStorageAdapter();
export const storageProvider = {
  LOCAL_STORAGE: "localStorage",
  INDEXED_DB: "indexedDB",
};

const hasAdapterMethod = (adapter, methodName) =>
  adapter && typeof adapter[methodName] === "function";

const validateAdapter = (adapter) => {
  const requiredMethods = [
    "getTransactionsByType",
    "appendTransaction",
    "replaceTransactionsByType",
  ];

  const missingMethod = requiredMethods.find((methodName) => !hasAdapterMethod(adapter, methodName));
  if (missingMethod) {
    throw new Error(`Storage adapter missing required method: ${missingMethod}`);
  }
};

export const setStorageAdapter = (adapter) => {
  validateAdapter(adapter);
  activeAdapter = adapter;
};

export const useLocalStorageAdapter = () => {
  setStorageAdapter(new LocalStorageAdapter());
};

export const useIndexedDBAdapter = (options = {}) => {
  setStorageAdapter(new IndexedDBAdapter(options));
};

export const configureStorageProvider = (
  provider = storageProvider.LOCAL_STORAGE,
  options = {},
) => {
  if (provider === storageProvider.INDEXED_DB) {
    useIndexedDBAdapter(options);
    return;
  }
  useLocalStorageAdapter();
};

export const getTransactionsByType = (type) => activeAdapter.getTransactionsByType(type);

export const appendTransaction = (transaction) => activeAdapter.appendTransaction(transaction);

export const replaceTransactionsByType = (type, transactions) =>
  activeAdapter.replaceTransactionsByType(type, transactions);
