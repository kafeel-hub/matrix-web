// Mirrors Matrix.Api/Models/GoldAccountVouchers/GoldAccountVoucherModels.cs
//
// Same RV/PV-share-one-shape situation as the plain account vouchers, plus
// legacy gold-fixing fields. Payment rows are field-for-field identical to
// AccountVoucherPaymentRequest, so that type is reused directly.
import type { AccountVoucherPaymentRequest } from "./accountVouchers";
import type { ValidationError } from "./common";

export interface GoldAccountVoucherHeaderRequest {
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
  // Legacy TranGoldFix fields. GoldWeight is always stored at purity 999 by
  // SP_Act_SaveVoucherWithFixing regardless of what's entered elsewhere.
  fixedGoldWeight: number;
  fixedGoldRate: number;
  fixedGoldAmount: number;
  // Used by the legacy Gold Payment Voucher only — kept zero/blank for Gold
  // Receipt Voucher (see docs/gold-receipt-payment-vouchers-v16.md).
  payGoldPurity: number;
  payGoldWeight: number;
  payGoldRemarks: string;
}

export type GoldAccountVoucherPaymentRequest = AccountVoucherPaymentRequest;

export interface GoldAccountVoucherRequest {
  header: GoldAccountVoucherHeaderRequest;
  payments: GoldAccountVoucherPaymentRequest[];
}

export interface GoldAccountVoucherSaveResponse {
  voucherNo: number;
  saved: boolean;
  posted: boolean;
  message: string;
  errors?: ValidationError[] | null;
}
