import { transactionType } from "../model";

class AddTransactionView{
    parentElement = document.querySelector(".add_transaction_form");
    valueInput = this.parentElement.querySelector(".value_input");
    typeSelect = this.parentElement.querySelector(".transaction_type");
    constructor(){
        this.typeSelect.addEventListener("change", ()=>{
            console.log("Type changed to ", this.typeSelect.value);
        });
    }

    addSubmitHandler(handler){
        this.parentElement.addEventListener("submit", handler.bind(this));
    }

    get amount(){
        return Number(this.valueInput.value);
    }

    get type(){
        return this.typeSelect.value;
    }

    clearForm(){
        this.valueInput.value = "";
        this.typeSelect.value = transactionType.INCOME;
    }

    showValidationError(message){
        this.valueInput.setCustomValidity(message);
        this.valueInput.reportValidity();
        this.valueInput.setCustomValidity("");
    }

}

export default new AddTransactionView();
