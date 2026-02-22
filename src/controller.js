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
        ExpenseTrackerView.render(await getTransactionsByType(transactionType.EXPENSES));
    } else if (type === transactionType.INCOME) {
        IncomeTrackerView.render(await getTransactionsByType(transactionType.INCOME));
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
 * Boots the UI by binding handlers and rendering all visible sections.
 */
const init = async ()=>{
    configureStorageProvider(storageProvider.LOCAL_STORAGE);
    // To migrate storage, switch to: storageProvider.INDEXED_DB
    await migrateRentEntriesToExpenses();
    AddTransactionView.addSubmitHandler(controllAddTransaction);
    BalanceView.render(await calculateTotalBalance());
    ExpenseTrackerView.render(await getTransactionsByType(transactionType.EXPENSES));
    IncomeTrackerView.render(await getTransactionsByType(transactionType.INCOME));
};

init().catch((error) => {
    console.error("Failed to initialize app:", error);
});
