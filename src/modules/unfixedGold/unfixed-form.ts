import type {
  UnfixedGoldHeaderRequest,
  UnfixedGoldItemRequest,
  UnfixedGoldPaymentRequest,
} from "@/types/unfixedGold";
import type { InvoiceItemResponse } from "@/types/catalog";

export type LineItemDraft = UnfixedGoldItemRequest & { key: string };
export type PaymentDraft = UnfixedGoldPaymentRequest & { key: string };

let keyCounter = 0;
function nextKey(prefix: string) {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

export function createEmptyHeader(defaults: { salesmanId: string }): UnfixedGoldHeaderRequest {
  return {
    transactionDate: new Date().toISOString(),
    partyId: "",
    partyName: "",
    referenceNo: "",
    voucherNo: "",
    salesmanId: defaults.salesmanId,
    remarks: "",
    invoiceType: 1,
    discountPercentage: 0,
    discountAmount: 0,
    taxAmount: 0,
    netAmount: 0,
    goldRate: 0,
    pureGoldPurity: 999,
    creditDays: 0,
  };
}

/**
 * Maps a scanned item onto an unfixed-sale/purchase line. `makingCost` and
 * `makingRate` start at 0 — the real API test payloads show these entered
 * manually per transaction, not prefilled from the item master.
 */
export function lineItemFromScan(item: InvoiceItemResponse, lineNo: number): LineItemDraft {
  const parsedPurity = Number.parseFloat(item.goldPurity) || 0;
  const netWeight = Math.max(item.grossWeight - item.stoneWeight, 0);
  const pureWeight = parsedPurity > 0 ? netWeight * (parsedPurity / 999) : netWeight;

  return {
    key: nextKey("unfixed-item"),
    lineNo,
    itemId: item.itemId,
    barcode: item.barcode,
    itemDescription: item.itemName,
    makingCost: 0,
    goldPurity: parsedPurity,
    quantity: 1,
    goldWeight: item.grossWeight,
    stoneWeight: item.stoneWeight,
    goldNetWeight: netWeight,
    goldPureWeight: pureWeight,
    makingRate: 0,
    stoneAmount: item.stoneValue,
    makingAmount: 0,
    amount: 0,
    unfixedAmount: 0,
    makingTypeId: 0,
  };
}

/**
 * Recomputes amount and unfixedAmount together whenever an input changes.
 * Both real API test payloads (docs/unfixed-sale-test-payload.json,
 * unfixed-purchase-test-payload.json) show unfixedAmount exactly mirroring
 * amount — there's no per-line gold rate to compute a "gold-only portion"
 * from (header.goldRate is a single reference value, genuinely 0/unpriced
 * in both examples). So unfixedAmount tracks amount by default here; it
 * stays independently editable in the table for whatever partial-fixing
 * scenarios the legacy form might support that a single example can't show.
 */
export function recalculateLine(line: LineItemDraft): LineItemDraft {
  const amount = round2(line.makingAmount + line.stoneAmount);
  return { ...line, amount, unfixedAmount: amount };
}

type LineItemsAction =
  | { type: "add"; line: LineItemDraft }
  | { type: "update"; key: string; patch: Partial<LineItemDraft> }
  | { type: "remove"; key: string }
  | { type: "reset" };

export function lineItemsReducer(state: LineItemDraft[], action: LineItemsAction): LineItemDraft[] {
  switch (action.type) {
    case "add":
      return [...state, action.line];
    case "update":
      return state.map((line) =>
        line.key === action.key ? recalculateLine({ ...line, ...action.patch }) : line,
      );
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

export function emptyPayment(lineNo: number, currencyId: string): PaymentDraft {
  return {
    key: nextKey("unfixed-payment"),
    lineNo,
    paymentTypeId: "",
    amount: 0,
    currencyId,
    exchangeRate: 1,
    currencyAmount: 0,
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

export interface UnfixedTotals {
  goldWeight: number;
  makingAmount: number;
  stoneAmount: number;
  subtotal: number;
}

export function calculateTotals(items: LineItemDraft[]): UnfixedTotals {
  const totals = items.reduce(
    (acc, line) => {
      acc.goldWeight += line.goldWeight;
      acc.makingAmount += line.makingAmount;
      acc.stoneAmount += line.stoneAmount;
      acc.subtotal += line.amount;
      return acc;
    },
    { goldWeight: 0, makingAmount: 0, stoneAmount: 0, subtotal: 0 },
  );
  return {
    goldWeight: round2(totals.goldWeight),
    makingAmount: round2(totals.makingAmount),
    stoneAmount: round2(totals.stoneAmount),
    subtotal: round2(totals.subtotal),
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
