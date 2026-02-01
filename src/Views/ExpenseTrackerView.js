import { ListView } from "./ListView";

class ExpenseTrackerView extends ListView {
  container = document.querySelector(".expense_container");
}

export default new ExpenseTrackerView();