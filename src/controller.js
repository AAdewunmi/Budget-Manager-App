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
    AddTransactionView.addSubmitHandler(controllAddTransaction);
    BalanceView.render(calculateTotalBalance())
    ExpenseTrackerView.render(getTransactionFromLS(transactionType.EXPENSES));
    IncomeTrackerView.render(getTransactionFromLS(transactionType.INCOME));
};

init();
