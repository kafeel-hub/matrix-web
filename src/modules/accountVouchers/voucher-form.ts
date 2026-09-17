import type { AccountVoucherHeaderRequest, AccountVoucherPaymentRequest } from "@/types/accountVouchers";

export type PaymentDraft = AccountVoucherPaymentRequest & { key: string };

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `voucher-payment-${keyCounter}`;
}

export function createEmptyHeader(): AccountVoucherHeaderRequest {
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
  };
}

export function emptyPayment(lineNo: number, currencyId: string): PaymentDraft {
  return {
    key: nextKey(),
    lineNo,
    paymentTypeId: "",
    amount: 0,
    accountNo: "",
    currencyId,
    exchangeRate: 1,
    currencyAmount: 0,
    chequeBank: "",
    chequeNo: "",
    chequeDate: null,
  };
}

type PaymentsAction =
  | { type: "add"; payment: PaymentDraft }
  | { type: "update"; key: string; patch: Partial<PaymentDraft> }
  | { type: "remove"; key: string }
  | { type: "reset" };

export function paymentsReducer(state: PaymentDraft[], action: PaymentsAction): PaymentDraft[] {
  switch (action.type) {
    case "add":
      return [...state, action.payment];
    case "update":
      return state.map((p) => (p.key === action.key ? { ...p, ...action.patch } : p));
    case "remove":
      return state.filter((p) => p.key !== action.key).map((p, i) => ({ ...p, lineNo: i + 1 }));
    case "reset":
      return [];
    default:
      return state;
  }
}

/** Per docs/receipt-payment-vouchers-v15.md: "Total/received amount is the sum of payment rows." */
export function totalOf(payments: PaymentDraft[]): number {
  const sum = payments.reduce((acc, p) => acc + p.amount, 0);
  return Math.round((sum + Number.EPSILON) * 1000) / 1000;
}
