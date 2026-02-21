/**
 * Supported transaction categories used across the app and localStorage keys.
 */
export const transactionType = {
    INCOME: 'INCOME',
    EXPENSES: 'EXPENSES',
};

/**
 * Domain model for a single budget transaction.
 */
export class Transaction {
    value;
    type;
    id;
    description;
    timestamp;

    /**
     * @param {"INCOME"|"EXPENSES"} type
     * @param {number} value
     * @param {string} [description=""]
     */
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
