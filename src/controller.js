import { Transaction, transactionType } from "./model";
import AddTransactionView from "./Views/AddTransactionView";
import BalanceView from "./Views/BalanceView";

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
    if (!Number.isFinite(amount)){
        AddTransactionView.showValidationError("Please enter a valid amount.");
        return;
    }
    const newTran = new Transaction(type, amount);
    saveTransactionInLS(newTran);
    AddTransactionView.clearForm();
    BalanceView.render(calculateTotalBalance());
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
};

init();
