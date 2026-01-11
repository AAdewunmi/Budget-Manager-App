import { Transaction, transactionType } from "./model";

const temp = new Transaction(transactionType.INCOME, 4000);

const getTransactionFromLS = (type)=>{
    return JSON.parse(localStorage.getItem(type) || '[]');
}