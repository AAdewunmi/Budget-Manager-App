import { transactionType } from "../model";

/**
 * Handles form field access and form-level UI behaviors.
 */
class AddTransactionView{
    parentElement = document.querySelector(".add_transaction_form");
    valueInput = this.parentElement.querySelector(".value_input");
    descriptionInput = this.parentElement.querySelector(".description_input");
    typeSelect = this.parentElement.querySelector(".transaction_type");

    constructor(){
        this.typeSelect.addEventListener("change", ()=>{
            console.log("Type changed to ", this.typeSelect.value);
        });
    }

    /**
     * Binds the provided submit handler to the transaction form.
     */
    addSubmitHandler(handler){
        this.parentElement.addEventListener("submit", handler.bind(this));
    }

    /**
     * Numeric amount entered by the user.
     */
    get amount(){
        return Number(this.valueInput.value);
    }

    /**
     * Selected transaction type.
     */
    get type(){
        return this.typeSelect.value;
    }

    /**
     * Free-text description from the form.
     */
    get description(){
        return this.descriptionInput.value;
    }

    /**
     * Resets form to default state after successful submit.
     */
    clearForm(){
        this.valueInput.value = "";
        this.descriptionInput.value = "";
        this.typeSelect.value = transactionType.INCOME;
    }

    /**
     * Shows a native validation message on the amount field.
     */
    showValidationError(message){
        this.valueInput.setCustomValidity(message);
        this.valueInput.reportValidity();
        this.valueInput.setCustomValidity("");
    }

}

export default new AddTransactionView();
