/**
 * Shared list renderer used by both Income and Expenses panels.
 */
export class ListView {
  title = "Transactions";
  emptyMessage = "No transactions yet.";

  /**
   * Renders a full list state for this container.
   */
  render(data) {
    this.data = Array.isArray(data) ? data : [];
    this.container.innerHTML = this.generateHTMLString();
  }

  /**
   * Appends a single transaction card to the current list.
   */
  pushTransitionInContainer(transaction) {
    this.container.insertAdjacentHTML(
      "beforeend",
      this.generateCardHTML(transaction),
    );
  }

  /**
   * Registers the change handler for the list filter select element.
   */
  addFilterChangeListner(handler){
    this.filterSelect.addEventLister("change", (event) =>{
        handler(event)
    });
  }

  /**
   * Formats values consistently as GBP currency.
   */
  formatCurrency(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "£0";
    return `£${amount.toLocaleString("en-GB")}`;
  }

  /**
   * Creates the markup for one transaction row.
   */
  generateCardHTML(transaction) {
    const description =
      (transaction.description || "").trim() || "No description";
    const valueClass = transaction.type === "EXPENSES" ? "red" : "green";
    return `<div class="transaction_card">
        <div>${description}
        - <span class="${valueClass}">${this.formatCurrency(transaction.value)}</span>
        - ${this.formatTimestamp(transaction.timestamp)}</div>
        </div>`;
  }

  /**
   * Converts epoch timestamp into a concise readable date.
   */
  formatTimestamp(timestamp) {
    return new Date(timestamp).toDateString();
  }

  /**
   * Builds complete panel markup including title and empty state.
   */
  generateHTMLString() {
    const cards = this.data.map((transaction) => this.generateCardHTML(transaction)).join("");
    const body = cards || `<div class="empty_state">${this.emptyMessage}</div>`;

    return `<h3 class="card_title">${this.title}</h3>${body}`;
  }
}
