import { ListView } from "./ListView";

class ExpenseTrackerView extends ListView {
  container = document.querySelector(".expense_container");
  title = "Expenses";
  emptyMessage = "No expenses yet.";
}

export default new ExpenseTrackerView();
