import { Transaction, transactionType } from "./model";
import AddTransactionView from "./Views/AddTransactionView";
import BalanceView from "./Views/BalanceView";
import ExpenseTrackerView from "./Views/ExpenseTrackerView";
import IncomeTrackerView from "./Views/IncomeTrackerView";

const getTransactionFromLS = (type)=>{
    return JSON.parse(localStorage.getItem(type) || '[]');
};

const saveTransactionInLS = (transaction) => {
    let data = getTransactionFromLS(transaction.type);
    if (Array.isArray(data)) {
        data.push(transaction);
        localStorage.setItem(transaction.type, JSON.stringify(data));
    }
};

const migrateRentEntriesToExpenses = ()=>{
    const incomes = getTransactionFromLS(transactionType.INCOME);
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

    const expenses = getTransactionFromLS(transactionType.EXPENSES);
    const safeExpenses = Array.isArray(expenses) ? expenses : [];

    localStorage.setItem(transactionType.INCOME, JSON.stringify(keptInIncome));
    localStorage.setItem(
      transactionType.EXPENSES,
      JSON.stringify([...safeExpenses, ...movedToExpenses]),
    );
};

const controllAddTransaction = (event)=> {
    event.preventDefault();
    const amount = AddTransactionView.amount;
    const type = AddTransactionView.type;
    const description = AddTransactionView.description;
    if (!Number.isFinite(amount)){
        AddTransactionView.showValidationError("Please enter a valid amount.");
        return;
    }
    const newTran = new Transaction(type, amount, description);
    saveTransactionInLS(newTran);
    AddTransactionView.clearForm();
    BalanceView.render(calculateTotalBalance());
    if (type === transactionType.EXPENSES) {
        ExpenseTrackerView.render(getTransactionFromLS(transactionType.EXPENSES));
    } else if (type === transactionType.INCOME) {
        IncomeTrackerView.render(getTransactionFromLS(transactionType.INCOME));
    }
} 

const calculateTotalBalance = ()=>{
    let expense = getTransactionFromLS(transactionType.EXPENSES);
    let income = getTransactionFromLS(transactionType.INCOME);
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

const init = ()=>{
    migrateRentEntriesToExpenses();
    AddTransactionView.addSubmitHandler(controllAddTransaction);
    BalanceView.render(calculateTotalBalance())
    ExpenseTrackerView.render(getTransactionFromLS(transactionType.EXPENSES));
    IncomeTrackerView.render(getTransactionFromLS(transactionType.INCOME));
};

init();
