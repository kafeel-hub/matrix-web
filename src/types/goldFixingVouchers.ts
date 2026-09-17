// Mirrors Matrix.Api/Models/GoldFixingVouchers/GoldFixingVoucherModels.cs
//
// GFS (sales) and GFP (purchase) share this exact shape — same
// server-picks-the-type-from-the-endpoint pattern as RV/PV and unfixed
// sale/purchase. Unlike those, this has no line items at all: it's a
// single aggregate weight/rate/making-amount per voucher, not a list of
// items. Per docs/gold-fixing-vouchers-v18.md, the legacy calculations are:
//   pureWeight = goldWeight * goldPurity / companyBasePurePurity
//   goldAmount = goldWeight * goldRate
//   total = goldAmount + makingAmount
// and: "making charge cannot be left on credit — a positive making amount
// requires payment rows." Confirmed against both real test payloads.
import type { ValidationError } from "./common";

export interface GoldFixingVoucherHeaderRequest {
  voucherDate: string;
  referenceNo: string;
  partyId: string;
  partyName: string;
  partyPhone: string;
  partyCivilId: string;
  currencyId: string;
  exchangeRate: number;
  goldPurity: number;
  goldWeight: number;
  goldRate: number;
  makingAmount: number;
  supplierInvoiceNo: string;
  salesmanId: string;
  remarks: string;
}

export interface GoldFixingPaymentRequest {
  lineNo: number;
  paymentTypeId: string;
  amount: number;
  accountNo: string;
  chequeBank: string;
  chequeNo: string;
  chequeDate?: string | null;
}

export interface GoldFixingVoucherRequest {
  header: GoldFixingVoucherHeaderRequest;
  payments: GoldFixingPaymentRequest[];
}

export interface GoldFixingVoucherSaveResponse {
  voucherNo: number;
  saved: boolean;
  posted: boolean;
  message: string;
  errors?: ValidationError[] | null;
}
