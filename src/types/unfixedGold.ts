// Mirrors Matrix.Api/Models/UnfixedGold/UnfixedGoldTransactionModels.cs
//
// Unfixed Sale (USAL) and Unfixed Purchase (UGLP) share this exact shape —
// same pattern as RV/PV: the server picks which transaction type to write
// based on which endpoint was called (/unfixed-sales vs /unfixed-purchases),
// the client never sends a type. "Unfixed" means the gold weight is
// recorded now but priced later via a separate Gold Fixing Voucher — see
// docs/unfixed-gold-v17.md and header.goldRate below.
import type { ValidationError } from "./common";

export interface UnfixedGoldHeaderRequest {
  transactionDate: string;
  partyId: string; // customer code for sales, supplier code for purchase
  partyName: string;
  referenceNo: string;
  voucherNo: string;
  salesmanId: string;
  remarks: string;
  invoiceType: number;
  discountPercentage: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  goldRate: number; // genuinely 0/unpriced at this stage in the real API examples — not a computation input
  pureGoldPurity: number;
  creditDays: number;
}

export interface UnfixedGoldItemRequest {
  lineNo: number;
  itemId: string;
  barcode: string;
  itemDescription: string;
  makingCost: number;
  goldPurity: number;
  quantity: number;
  goldWeight: number;
  stoneWeight: number;
  goldNetWeight: number;
  goldPureWeight: number;
  makingRate: number;
  stoneAmount: number;
  makingAmount: number;
  amount: number;
  unfixedAmount: number; // legacy ProdUnfixAmt — the provisional, not-yet-priced value for this line
  makingTypeId: number;
}

export interface UnfixedGoldPaymentRequest {
  lineNo: number;
  paymentTypeId: string;
  amount: number;
  currencyId: string;
  exchangeRate: number;
  currencyAmount: number;
}

export interface UnfixedGoldRequest {
  header: UnfixedGoldHeaderRequest;
  items: UnfixedGoldItemRequest[];
  payments: UnfixedGoldPaymentRequest[];
}

export interface UnfixedGoldSaveResponse {
  transactionNo: number;
  saved: boolean;
  posted: boolean;
  message: string;
  errors?: ValidationError[] | null;
}
