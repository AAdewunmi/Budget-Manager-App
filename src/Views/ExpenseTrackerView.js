import { ListView } from "./ListView";

/**
 * Expense-specific list panel shown on the middle/right side of the layout.
 */
class ExpenseTrackerView extends ListView {
  container = document.querySelector(".expense_container");
  title = "Expenses";
  emptyMessage = "No expenses yet.";
  filterSelect = document.querySelector("#expense_filter")
}

export default new ExpenseTrackerView();
