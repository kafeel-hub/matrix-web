// Mirrors Matrix.Api/Models/PettyCashExpenses/PettyCashExpenseRequest.cs
import type { ValidationError } from "./common";

export interface PettyCashExpenseHeaderRequest {
  voucherDate: string;
  cashAccountNo: string;
  manualNo: string;
  remarks: string;
}

export interface PettyCashExpenseItemRequest {
  lineNo: number;
  accountNo: string;
  narration: string;
  amount: number;
}

export interface PettyCashExpenseRequest {
  header: PettyCashExpenseHeaderRequest;
  items: PettyCashExpenseItemRequest[];
}

export interface PettyCashExpenseSaveResponse {
  voucherNo: number;
  saved: boolean;
  posted: boolean;
  message: string;
  errors?: ValidationError[] | null;
}
