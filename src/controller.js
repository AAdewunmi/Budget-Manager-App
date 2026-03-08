import { Transaction, transactionType } from "./model";
import {
    appendTransaction,
    configureStorageProvider,
    getTransactionsByType,
    migrateLocalStorageDataToActiveAdapter,
    replaceTransactionsByType,
    storageProvider,
} from "./storage";
import AddTransactionView from "./Views/AddTransactionView";
import BalanceView from "./Views/BalanceView";
import ExpenseTrackerView from "./Views/ExpenseTrackerView";
import IncomeTrackerView from "./Views/IncomeTrackerView";

/**
 * One-time corrective migration:
 * if a previously saved income description looks like "rent/reent",
 * move it into expenses.
 */
const migrateRentEntriesToExpenses = async ()=>{
    const incomes = await getTransactionsByType(transactionType.INCOME);
    if (!Array.isArray(incomes) || incomes.length === 0) return;

    const rentLikePattern = /\bre+nt\b/i;
    const movedToExpenses = [];
    const keptInIncome = [];

    incomes.forEach((transaction)=>{
        const description = String(transaction?.description || "").trim();
        if (rentLikePattern.test(description)) {
            movedToExpenses.push({
                ...transaction,
                type: transactionType.EXPENSES,
            });
        } else {
            keptInIncome.push(transaction);
        }
    });

    if (movedToExpenses.length === 0) return;

    const expenses = await getTransactionsByType(transactionType.EXPENSES);
    const safeExpenses = Array.isArray(expenses) ? expenses : [];

    await replaceTransactionsByType(transactionType.INCOME, keptInIncome);
    await replaceTransactionsByType(
        transactionType.EXPENSES,
        [...safeExpenses, ...movedToExpenses],
    );
};

/**
 * One-time browser-side migration: push any legacy localStorage data
 * into the SQLite API backend.
 */
const migrateLegacyLocalStorageToSQLiteApi = async () => {
    const migrationKey = "budget_sqlite_migration_v1_done";
    if (localStorage.getItem(migrationKey) === "true") return;

    const safeParse = (value) => {
        try {
            const parsed = JSON.parse(value || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch (_error) {
            return [];
        }
    };

    const incomes = safeParse(localStorage.getItem(transactionType.INCOME));
    const expenses = safeParse(localStorage.getItem(transactionType.EXPENSES));
    if (incomes.length === 0 && expenses.length === 0) {
        localStorage.setItem(migrationKey, "true");
        return;
    }

    await migrateLocalStorageDataToActiveAdapter({ incomes, expenses });
    localStorage.setItem(migrationKey, "true");
};

/**
 * Handles form submission, validation, confirmation and targeted UI refresh.
 */
const controllAddTransaction = async (event)=> {
    event.preventDefault();
    const amount = AddTransactionView.amount;
    const type = AddTransactionView.type;
    const description = AddTransactionView.description;
    if (!Number.isFinite(amount)){
        AddTransactionView.showValidationError("Please enter a valid amount.");
        return;
    }

    if (type === transactionType.INCOME) {
        // Guardrail: reduce accidental income submissions.
        const isConfirmed = window.confirm(
          "You selected Income. Are you sure this is not an expense?",
        );
        if (!isConfirmed) return;
    }

    const newTran = new Transaction(type, amount, description);
    await appendTransaction(newTran);
    AddTransactionView.clearForm();
    await renderDashboardState();
} 

/**
 * Resets all stored transactions and restores default list/filter UI state.
 */
const controlResetDashboard = async ()=> {
    const isConfirmed = window.confirm(
        "This will remove all income and expense records. Continue?",
    );
    if (!isConfirmed) return;

    await replaceTransactionsByType(transactionType.INCOME, []);
    await replaceTransactionsByType(transactionType.EXPENSES, []);

    IncomeTrackerView.filterSelect.value = "date";
    ExpenseTrackerView.filterSelect.value = "date";
    AddTransactionView.clearForm();
    await renderDashboardState();
};

/**
 * Computes the current net balance from stored income and expense records.
 */
const calculateTotalBalance = async ()=>{
    let expense = await getTransactionsByType(transactionType.EXPENSES);
    let income = await getTransactionsByType(transactionType.INCOME);
    let total = 0;
    if(Array.isArray(expense) && Array.isArray(income)){
        income.forEach((inc)=>{
            total += inc.value;
        });
        expense.forEach((exp) => {
          total -= exp.value;
        });
    }
    return total;
}

/**
 * Sorts transactions by the selected filter value.
 */
const sortTransactionsByFilter = (transactions, filterValue) => {
    const sortedTransactions = [...transactions];

    if (filterValue === "date") {
        // Most recent first keeps new entries visible at the top.
        sortedTransactions.sort(
            (a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0),
        );
        return sortedTransactions;
    }

    if (filterValue === "amount+") {
        sortedTransactions.sort((a, b) => Number(a?.value || 0) - Number(b?.value || 0));
        return sortedTransactions;
    }

    if (filterValue === "amount-") {
        sortedTransactions.sort((a, b) => Number(b?.value || 0) - Number(a?.value || 0));
        return sortedTransactions;
    }

    return sortedTransactions;
};

/**
 * Renders balance and both transaction lists using current filter selections.
 */
const renderDashboardState = async () => {
    BalanceView.render(await calculateTotalBalance());
    const expenses = await getTransactionsByType(transactionType.EXPENSES);
    const incomes = await getTransactionsByType(transactionType.INCOME);
    ExpenseTrackerView.render(
        sortTransactionsByFilter(
            Array.isArray(expenses) ? expenses : [],
            String(ExpenseTrackerView.filterSelect?.value || "date").toLowerCase(),
        ),
    );
    IncomeTrackerView.render(
        sortTransactionsByFilter(
            Array.isArray(incomes) ? incomes : [],
            String(IncomeTrackerView.filterSelect?.value || "date").toLowerCase(),
        ),
    );
};

/**
 * Moves one transaction from its current type bucket to the opposite type bucket.
 */
const swapTransactionType = async ({ id, type }) => {
    if (!id) return;
    const sourceType = type === transactionType.EXPENSES
        ? transactionType.EXPENSES
        : transactionType.INCOME;
    const targetType = sourceType === transactionType.INCOME
        ? transactionType.EXPENSES
        : transactionType.INCOME;

    const sourceTransactions = await getTransactionsByType(sourceType);
    const targetTransactions = await getTransactionsByType(targetType);
    if (!Array.isArray(sourceTransactions) || !Array.isArray(targetTransactions)) return;

    const sourceIndex = sourceTransactions.findIndex(
        (transaction) => String(transaction?.id || "") === String(id),
    );
    if (sourceIndex < 0) return;

    const safeSource = [...sourceTransactions];
    const [transactionToMove] = safeSource.splice(sourceIndex, 1);
    const movedTransaction = {
        ...transactionToMove,
        type: targetType,
    };

    await replaceTransactionsByType(sourceType, safeSource);
    await replaceTransactionsByType(targetType, [...targetTransactions, movedTransaction]);
};

/**
 * Handles filter changes for income/expense lists.
 */
const controlFilterChange = async (ev) => {
    const isIncomeFilter = ev.target.id === "income_filter";
    const type = isIncomeFilter ? transactionType.INCOME : transactionType.EXPENSES;
    const targetView = isIncomeFilter ? IncomeTrackerView : ExpenseTrackerView;
    const transactions = await getTransactionsByType(type);
    const safeTransactions = Array.isArray(transactions) ? [...transactions] : [];
    const sortedTransactions = sortTransactionsByFilter(
        safeTransactions,
        String(ev.target.value || "").toLowerCase(),
    );
    targetView.render(sortedTransactions);
};

/**
 * Handles swap button clicks from either list panel.
 */
const controlSwapTransaction = async ({ id, type }) => {
    const destinationLabel = type === transactionType.EXPENSES ? "Income" : "Expenses";
    const isConfirmed = window.confirm(
        `Move this transaction to ${destinationLabel}?`,
    );
    if (!isConfirmed) return;
    await swapTransactionType({ id, type });
    await renderDashboardState();
};

/**
 * Boots the UI by binding handlers and rendering all visible sections.
 */
const init = async ()=>{
    configureStorageProvider(storageProvider.SQLITE_API, {
        baseUrl: "http://localhost:3001/api",
    });
    await migrateLegacyLocalStorageToSQLiteApi();
    await migrateRentEntriesToExpenses();
    AddTransactionView.addSubmitHandler(controllAddTransaction);
    AddTransactionView.addResetHandler(controlResetDashboard);
    IncomeTrackerView.addSwapHandler(controlSwapTransaction);
    ExpenseTrackerView.addSwapHandler(controlSwapTransaction);
    await renderDashboardState();
    IncomeTrackerView.addFilterChangeListner(controlFilterChange);
    ExpenseTrackerView.addFilterChangeListner(controlFilterChange);
};

init().catch((error) => {
    console.error("Failed to initialize app:", error);
});
