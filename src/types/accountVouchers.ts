// Mirrors Matrix.Api/Models/AccountVouchers/AccountVoucherModels.cs
//
// RV and PV share this exact same request/response shape — the server
// controls which voucher type gets written based on which endpoint was
// called (POST /receipt-vouchers vs POST /payment-vouchers), the client
// never sends a type. See docs/receipt-payment-vouchers-v15.md: "header.AccountNo"
// is "the main account" (written to both v_AccountNo and v_ContraActNo) —
// a general postable account (party or GL), NOT restricted to cash/bank —
// confirmed by the test payloads using a generic "ACTIVE_POSTABLE_ACCOUNT"
// placeholder. Payment rows are the actual receipt/payment methods; their
// own `accountNo` is sent empty in the real test payloads, confirming it's
// an optional reference field (same treatment as the equivalent field on
// sales invoice payments), not a required account selection.
import type { ValidationError } from "./common";

export interface AccountVoucherHeaderRequest {
  voucherDate: string;
  accountNo: string;
  manualNo: string;
  paidTo: string;
  remarks: string;
  civilId: string;
  phoneNo: string;
  salesman: string;
  discountPercentage: number;
  discountAmount: number;
}

export interface AccountVoucherPaymentRequest {
  lineNo: number;
  paymentTypeId: string;
  amount: number;
  accountNo: string;
  currencyId: string;
  exchangeRate: number;
  currencyAmount: number;
  chequeBank: string;
  chequeNo: string;
  chequeDate?: string | null;
}

export interface AccountVoucherRequest {
  header: AccountVoucherHeaderRequest;
  payments: AccountVoucherPaymentRequest[];
}

export interface AccountVoucherSaveResponse {
  voucherNo: number;
  saved: boolean;
  posted: boolean;
  message: string;
  errors?: ValidationError[] | null;
}
