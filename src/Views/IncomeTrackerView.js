import { ListView } from "./ListView";

class IncomeTrackerView extends ListView {
  container = document.querySelector(".income_container");
  title = "Income";
  emptyMessage = "No income yet.";
}

export default new IncomeTrackerView();
