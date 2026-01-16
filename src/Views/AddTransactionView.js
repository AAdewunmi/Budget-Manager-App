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
}

export default new AddTransactionView();