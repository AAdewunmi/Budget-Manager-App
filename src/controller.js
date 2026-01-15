import { Transaction, transactionType } from "./model";
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

const temp = new Transaction(transactionType.INCOME, 4000);
saveTransactionInLS(temp)
console.log(temp)