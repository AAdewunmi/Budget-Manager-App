export class ListView {
  render(data) {
    this.data = data;
    const html = this.generateHTMLString();
    this.container.innerHTML = html;
  }

  pushTransitionInContainer(transaction) {
    this.container.insertAdjacentHTML(
      "afterbegin",
      this.generateCardHTML(transaction),
    );
  }

  generateCardHTML(transaction) {
    const description =
      (transaction.description || "").trim() || "No description";
    const valueClass = transaction.type == "EXPENSES" ? "red" : "green";
    return `<div class="transaction_card">
        <div>${description} 
        - <span class="${valueClass}">${transaction.value}</span> 
        - ${this.formatTimestamp(transaction.timestamp)}</div>
        </div>`;
  }

  formatTimestamp(timestamp) {
    return new Date(timestamp).toDateString();
  }

  generateHTMLString() {
    const data = this.data;
    let html = "";
    if (Array.isArray(data)) {
      data.forEach((transaction) => {
        html += this.generateCardHTML(transaction);
      });
    }
    return html;
  }
}
