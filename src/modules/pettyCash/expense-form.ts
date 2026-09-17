import type { PettyCashExpenseHeaderRequest, PettyCashExpenseItemRequest } from "@/types/pettyCash";

// `accountName` is a client-only display field, not part of
// PettyCashExpenseItemRequest — it exists purely so AccountPicker can show
// a friendly name instead of a bare account code after selection. It's
// stripped out in NewPettyCashExpensePage's buildRequest() before saving.
export type ExpenseLineDraft = PettyCashExpenseItemRequest & { key: string; accountName?: string };

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `expense-line-${keyCounter}`;
}

export function createEmptyHeader(): PettyCashExpenseHeaderRequest {
  return {
    voucherDate: new Date().toISOString(),
    cashAccountNo: "",
    manualNo: "",
    remarks: "",
  };
}

export function emptyLine(lineNo: number): ExpenseLineDraft {
  return { key: nextKey(), lineNo, accountNo: "", accountName: "", narration: "", amount: 0 };
}

type LinesAction =
  | { type: "add"; line: ExpenseLineDraft }
  | { type: "update"; key: string; patch: Partial<ExpenseLineDraft> }
  | { type: "remove"; key: string }
  | { type: "reset" };

export function linesReducer(state: ExpenseLineDraft[], action: LinesAction): ExpenseLineDraft[] {
  switch (action.type) {
    case "add":
      return [...state, action.line];
    case "update":
      return state.map((line) => (line.key === action.key ? { ...line, ...action.patch } : line));
    case "remove":
      return state
        .filter((line) => line.key !== action.key)
        .map((line, index) => ({ ...line, lineNo: index + 1 }));
    case "reset":
      return [];
    default:
      return state;
  }
}

export function totalOf(lines: ExpenseLineDraft[]): number {
  const sum = lines.reduce((acc, line) => acc + line.amount, 0);
  return Math.round((sum + Number.EPSILON) * 1000) / 1000;
}
