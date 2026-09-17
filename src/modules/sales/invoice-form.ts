import type {
  SalesInvoiceHeaderRequest,
  SalesInvoiceItemRequest,
  SalesInvoicePaymentRequest,
} from "@/types/sales";
import type { InvoiceItemResponse } from "@/types/catalog";

/**
 * `partyType` defaults to 1 to match `CustomerController`'s `Prt_Type=1`
 * convention for the credit-customer master — set back to 0 for a walk-in
 * sale with no master record. `invoiceType`/`invoiceAgainst` are legacy
 * numeric flags without a known code list here; left at 0 and exposed as
 * plain number inputs under "Additional details" rather than guessed enums.
 */
export function createEmptyHeader(defaults: {
  currencyId: string;
  salesmanId: string;
}): SalesInvoiceHeaderRequest {
  return {
    invoiceDate: new Date().toISOString(),
    invoiceType: 0,
    invoiceAgainst: 0,
    referenceNo: "",
    partyType: 0,
    customerId: "",
    customerName: "",
    customerNameArabic: "",
    customerAddress1: "",
    customerAddress2: "",
    customerPhone: "",
    customerMobile: "",
    customerCivilId: "",
    customerCrNo: "",
    customerAreaCode: "",
    customerCountryCode: "",
    customerBlock: "",
    customerJaddah: "",
    customerStreet: "",
    customerBuilding: "",
    customerFloor: "",
    customerFlat: "",
    customerPaciNo: "",
    salesmanId: defaults.salesmanId,
    currencyId: defaults.currencyId,
    exchangeRate: 1,
    totalAmount: 0,
    discountPercentage: 0,
    discountAmount: 0,
    itemDiscountAmount: 0,
    netAmount: 0,
    taxAmount: 0,
    makingAmount: 0,
    goldAmount: 0,
    grossWeight: 0,
    pureWeight: 0,
    goldRate: 0,
    marketGoldRate: 0,
    stoneWeight: 0,
    stoneAmount: 0,
    deliveryCharge: 0,
    giftCharge: 0,
    otherCharge1: 0,
    otherCharge2: 0,
    remarks: "",
    remarks2: "",
    cashLimitConfirmed: false,
  };
}

// --- Line items ------------------------------------------------------------

export type LineItemDraft = SalesInvoiceItemRequest & { key: string };
export type PaymentDraft = SalesInvoicePaymentRequest & { key: string };

let keyCounter = 0;
function nextKey(prefix: string) {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

/**
 * Maps a scanned item onto an invoice line with sensible starting values.
 *
 * NOTE ON ASSUMPTIONS: the scan endpoint doesn't return `transactionTypeId`,
 * `makingTypeId`, or a raw gold rate/making rate — those are legacy numeric
 * codes whose exact meaning lives in stored procedures this frontend
 * doesn't have visibility into. Defaults below (1/1) are placeholders,
 * left as plain, editable number fields in the UI rather than a dropdown
 * with guessed labels, so nothing is silently wrong. Confirm the actual
 * code list with whoever owns `Gold_SaveTranDetail_*` before relying on
 * this in production.
 */
export function lineItemFromScan(item: InvoiceItemResponse, lineNo: number): LineItemDraft {
  const parsedPurity = Number.parseFloat(item.goldPurity) || 0;
  const netWeight = Math.max(item.grossWeight - item.stoneWeight, 0);
  const pureWeight = parsedPurity > 0 ? netWeight * (parsedPurity / 999) : netWeight;

  return {
    key: nextKey("item"),
    lineNo,
    itemId: item.itemId,
    barcode: item.barcode,
    itemDescription: item.itemName,
    invoiceItemDescription: item.itemName,
    serialNo: "",
    origin: "",
    size: "",
    transactionTypeId: 1,
    makingTypeId: 1,
    goldPurity: parsedPurity,
    quantity: 1,
    goldWeight: item.grossWeight,
    stoneWeight: item.stoneWeight,
    customerGoldWeight: 0,
    goldNetWeight: netWeight,
    goldPureWeight: pureWeight,
    goldRate: 0,
    makingRate: 0,
    makingCost: 0,
    rate: item.salePrice,
    amount: item.salePrice,
    makingAmount: 0,
    goldAmount: item.salePrice,
    stoneAmount: item.stoneValue,
    wasteAmount: 0,
    taxPercentage: 0,
    deductionWeight: 0,
    deductionPercentage: 0,
    repairFlag: false,
    repairWeight: 0,
  };
}

/**
 * Recomputes the derived fields on a line whenever quantity/rate/making/
 * stone inputs change. Kept as one small pure function so every input
 * handler in the table calls the same math instead of drifting apart.
 */
export function recalculateLine(line: LineItemDraft): LineItemDraft {
  const goldAmount = round2(line.quantity * line.rate);
  const amount = round2(goldAmount + line.makingAmount + line.stoneAmount - line.wasteAmount);
  return { ...line, goldAmount, amount };
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

// --- Payments ----------------------------------------------------------

export function emptyPayment(lineNo: number, currencyId: string): PaymentDraft {
  return {
    key: nextKey("payment"),
    lineNo,
    paymentTypeId: "",
    amount: 0,
    currencyId,
    exchangeRate: 1,
    currencyAmount: 0,
    authorizationCode: "",
    accountNo: "",
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

// --- Totals --------------------------------------------------------------

export interface InvoiceTotals {
  grossWeight: number;
  pureWeight: number;
  stoneWeight: number;
  stoneAmount: number;
  makingAmount: number;
  goldAmount: number;
  totalAmount: number;
  taxAmount: number;
}

/**
 * Client-side preview totals only. `TransactionValidationService` on the
 * server re-derives and validates the whole invoice, so this exists purely
 * so the cashier sees running numbers while building the invoice — always
 * trust the saved `SalesInvoiceSaveResponse` over this preview.
 */
export function calculateTotals(items: LineItemDraft[]): InvoiceTotals {
  const totals = items.reduce(
    (acc, line) => {
      acc.grossWeight += line.goldWeight;
      acc.pureWeight += line.goldPureWeight;
      acc.stoneWeight += line.stoneWeight;
      acc.stoneAmount += line.stoneAmount;
      acc.makingAmount += line.makingAmount;
      acc.goldAmount += line.goldAmount;
      acc.totalAmount += line.amount;
      acc.taxAmount += line.amount * (line.taxPercentage / 100);
      return acc;
    },
    {
      grossWeight: 0,
      pureWeight: 0,
      stoneWeight: 0,
      stoneAmount: 0,
      makingAmount: 0,
      goldAmount: 0,
      totalAmount: 0,
      taxAmount: 0,
    },
  );

  return {
    grossWeight: round2(totals.grossWeight),
    pureWeight: round2(totals.pureWeight),
    stoneWeight: round2(totals.stoneWeight),
    stoneAmount: round2(totals.stoneAmount),
    makingAmount: round2(totals.makingAmount),
    goldAmount: round2(totals.goldAmount),
    totalAmount: round2(totals.totalAmount),
    taxAmount: round2(totals.taxAmount),
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
