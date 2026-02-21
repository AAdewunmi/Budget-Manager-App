export class ListView {
  title = "Transactions";
  emptyMessage = "No transactions yet.";

  render(data) {
    this.data = Array.isArray(data) ? data : [];
    this.container.innerHTML = this.generateHTMLString();
  }

  pushTransitionInContainer(transaction) {
    this.container.insertAdjacentHTML(
      "beforeend",
      this.generateCardHTML(transaction),
    );
  }

  formatCurrency(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "£0";
    return `£${amount.toLocaleString("en-GB")}`;
  }

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

  formatTimestamp(timestamp) {
    return new Date(timestamp).toDateString();
  }

  generateHTMLString() {
    const cards = this.data.map((transaction) => this.generateCardHTML(transaction)).join("");
    const body = cards || `<div class="empty_state">${this.emptyMessage}</div>`;

    return `<h3 class="card_title">${this.title}</h3>${body}`;
  }
}
