import type { GoldFixingPaymentRequest, GoldFixingVoucherHeaderRequest } from "@/types/goldFixingVouchers";

export type PaymentDraft = GoldFixingPaymentRequest & { key: string };

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `fixing-payment-${keyCounter}`;
}

export function createEmptyHeader(defaults: {
  currencyId: string;
  goldPurity: number;
}): GoldFixingVoucherHeaderRequest {
  return {
    voucherDate: new Date().toISOString(),
    referenceNo: "",
    partyId: "",
    partyName: "",
    partyPhone: "",
    partyCivilId: "",
    currencyId: defaults.currencyId,
    exchangeRate: 1,
    goldPurity: defaults.goldPurity,
    goldWeight: 0,
    goldRate: 0,
    makingAmount: 0,
    supplierInvoiceNo: "",
    salesmanId: "",
    remarks: "",
  };
}

export function emptyPayment(lineNo: number): PaymentDraft {
  return {
    key: nextKey(),
    lineNo,
    paymentTypeId: "",
    amount: 0,
    accountNo: "",
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

export function totalPaymentsOf(payments: PaymentDraft[]): number {
  const sum = payments.reduce((acc, p) => acc + p.amount, 0);
  return round2(sum);
}

export interface FixingCalculation {
  pureWeight: number;
  goldAmount: number;
  total: number;
}

/**
 * Per docs/gold-fixing-vouchers-v18.md, confirmed against both real test
 * payloads: pureWeight = weight * purity / company base pure purity;
 * goldAmount = weight * rate; total = goldAmount + makingAmount.
 * `basePurePurity` is the company's configured base (from bootstrap
 * `companySettings.basePureGoldPurity`, typically 999).
 */
export function calculateFixing(
  header: GoldFixingVoucherHeaderRequest,
  basePurePurity: number,
): FixingCalculation {
  const pureWeight = basePurePurity > 0 ? (header.goldWeight * header.goldPurity) / basePurePurity : 0;
  const goldAmount = header.goldWeight * header.goldRate;
  const total = goldAmount + header.makingAmount;
  return { pureWeight: round2(pureWeight), goldAmount: round2(goldAmount), total: round2(total) };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
