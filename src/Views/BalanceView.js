class BalanceView{
    container = document.querySelector(".balance");
    render(balance){
        this.container.innerHTML = 
        `<div class="${balance > 0 ? "green" : "red"}">${balance}</div>`;
    }
}

export default new BalanceView();