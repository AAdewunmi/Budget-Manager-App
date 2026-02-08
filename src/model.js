export const transactionType = {
    INCOME: 'INCOME',
    EXPENSES: 'EXPENSES',
};

export class Transaction {
    value;
    type;
    id;
    description;
    timestamp;

    constructor(type, value, description = ""){
        if (typeof value !== 'number' || isNaN(value)){
            throw new Error('Value must be a valid number');
        }
        this.value = value;
        this.description = String(description).trim();
        if (!(type in transactionType)){
            throw new Error('Type must be INCOME or EXPENSES');
        }
        this.type = type;
        this.id = `${type} - ${value} - ${Math.random().toFixed(4) * 100}`;
        this.timestamp = Date.now()
    }
}
