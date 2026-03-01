import { ListView } from "./ListView";

/**
 * Income-specific list panel shown on the left side of the layout.
 */
class IncomeTrackerView extends ListView {
  container = document.querySelector(".income_container");
  title = "Income";
  emptyMessage = "No income yet.";
  filterSelect = document.querySelector("#income_filter");
}

export default new IncomeTrackerView();
