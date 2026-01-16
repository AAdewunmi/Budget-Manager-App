import { Transaction, transactionType } from "./model";
import AddTransactionView from "./Views/AddTransactionView";
import AddTransaction from "./Views/AddTransactionView";

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
    event.previewDefault();
    const { amount, type } = AddTransactionView;
    const newTran = new Transaction(type, amount);
    saveTransactionInLS(newTran);
} 

const init = ()=>{
    AddTransactionView.addSubmitHandler(controllAddTransaction)
};

init();