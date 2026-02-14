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
    return `<div class="transaction_card">
        <div>${description} - ${transaction.value} - ${this.formatTimestamp(transaction.timestamp)}</div>
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
