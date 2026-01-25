class BalanceView{
    container = document.querySelector(".balance");
    render(balance){
        this.container.innerHTML = balance;
    }
}

export default BalanceView();