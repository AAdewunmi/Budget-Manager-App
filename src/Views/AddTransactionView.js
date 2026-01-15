class AddTransactionView{
    parentElement = document.querySelector(".add_transaction_form");
    valueInput = this.parentElement.querySelector(".value_input");
    constructor(){
        this.parentElement.addEventListener("submit",()=>{
            console.log("Value is ..... ", this.valueInput.value);
        })
    }
}

export default new AddTransactionView();