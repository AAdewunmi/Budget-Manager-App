import { Transaction } from "./model";
import AddTransactionView from "./Views/AddTransactionView";

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
    const newTran = new Transaction(type, amount);
    saveTransactionInLS(newTran);
    AddTransactionView.clearForm();
} 

const init = ()=>{
    AddTransactionView.addSubmitHandler(controllAddTransaction)
};

init();
