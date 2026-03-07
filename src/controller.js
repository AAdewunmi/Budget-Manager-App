import { Transaction, transactionType } from "./model";
import {
    appendTransaction,
    configureStorageProvider,
    getTransactionsByType,
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
    BalanceView.render(await calculateTotalBalance());
    if (type === transactionType.EXPENSES) {
        const expenses = await getTransactionsByType(transactionType.EXPENSES);
        const filterValue = String(ExpenseTrackerView.filterSelect?.value || "date").toLowerCase();
        ExpenseTrackerView.render(
            sortTransactionsByFilter(Array.isArray(expenses) ? expenses : [], filterValue),
        );
    } else if (type === transactionType.INCOME) {
        const incomes = await getTransactionsByType(transactionType.INCOME);
        const filterValue = String(IncomeTrackerView.filterSelect?.value || "date").toLowerCase();
        IncomeTrackerView.render(
            sortTransactionsByFilter(Array.isArray(incomes) ? incomes : [], filterValue),
        );
    }
} 

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
 * Boots the UI by binding handlers and rendering all visible sections.
 */
const init = async ()=>{
    configureStorageProvider(storageProvider.LOCAL_STORAGE);
    // To migrate storage, switch to: storageProvider.INDEXED_DB
    await migrateRentEntriesToExpenses();
    AddTransactionView.addSubmitHandler(controllAddTransaction);
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
    IncomeTrackerView.addFilterChangeListner(controlFilterChange);
    ExpenseTrackerView.addFilterChangeListner(controlFilterChange);
};

init().catch((error) => {
    console.error("Failed to initialize app:", error);
});
