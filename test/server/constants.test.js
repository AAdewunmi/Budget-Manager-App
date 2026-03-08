const test = require("node:test");
const assert = require("node:assert/strict");

const { TRANSACTION_TYPES } = require("../../server/constants");

test("TRANSACTION_TYPES exports supported values", () => {
  assert.deepEqual(TRANSACTION_TYPES, {
    INCOME: "INCOME",
    EXPENSES: "EXPENSES",
  });
});
