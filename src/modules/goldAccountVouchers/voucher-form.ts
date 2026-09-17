import type { GoldAccountVoucherHeaderRequest } from "@/types/goldAccountVouchers";

export function createEmptyHeader(): GoldAccountVoucherHeaderRequest {
  return {
    voucherDate: new Date().toISOString(),
    accountNo: "",
    manualNo: "",
    paidTo: "",
    remarks: "",
    civilId: "",
    phoneNo: "",
    salesman: "",
    discountPercentage: 0,
    discountAmount: 0,
    fixedGoldWeight: 0,
    fixedGoldRate: 0,
    fixedGoldAmount: 0,
    payGoldPurity: 0,
    payGoldWeight: 0,
    payGoldRemarks: "",
  };
}

// Payment rows are field-for-field identical to the plain account voucher's
// (GoldAccountVoucherPaymentRequest = AccountVoucherPaymentRequest in
// types/goldAccountVouchers.ts), so the reducer, totals math, and payments
// table are reused directly rather than duplicated:
export {
  paymentsReducer,
  emptyPayment,
  totalOf,
  type PaymentDraft,
} from "@/modules/accountVouchers/voucher-form";
