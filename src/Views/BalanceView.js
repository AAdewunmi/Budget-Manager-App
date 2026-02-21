class BalanceView{
    container = document.querySelector(".balance");
    formatCurrency(balance){
        const amount = Number(balance);
        if (!Number.isFinite(amount)) return "£0";
        return `£${amount.toLocaleString("en-GB")}`;
    }
    render(balance){
        this.container.innerHTML = 
        `<div class="${balance > 0 ? "green" : "red"}">${this.formatCurrency(balance)}</div>`;
    }
}

export default new BalanceView();
