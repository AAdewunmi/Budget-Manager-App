/**
 * Renders the net account balance widget.
 */
class BalanceView{
    container = document.querySelector(".balance");

    /**
     * Formats a raw numeric amount into GBP display format.
     */
    formatCurrency(balance){
        const amount = Number(balance);
        if (!Number.isFinite(amount)) return "£0";
        return `£${amount.toLocaleString("en-GB")}`;
    }

    /**
     * Updates the balance display and applies positive/negative color coding.
     */
    render(balance){
        this.container.innerHTML = 
        `<div class="${balance > 0 ? "green" : "red"}">${this.formatCurrency(balance)}</div>`;
    }
}

export default new BalanceView();
