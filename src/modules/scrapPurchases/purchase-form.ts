import type { ScrapPurchaseHeaderRequest, ScrapPurchaseItemRequest } from "@/types/scrapPurchases";
import type { InvoiceItemResponse } from "@/types/catalog";

export type LineItemDraft = ScrapPurchaseItemRequest & { key: string };

let keyCounter = 0;
function nextKey(prefix: string) {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

export function createEmptyHeader(defaults: { salesmanId: string }): ScrapPurchaseHeaderRequest {
  return {
    invoiceDate: new Date().toISOString(),
    invoiceType: 0,
    referenceNo: "",
    customerName: "",
    customerCivilId: "",
    customerMobile: "",
    customerPhone: "",
    customerCountryCode: "",
    customerAreaCode: "",
    customerBlock: "",
    customerJaddah: "",
    customerStreet: "",
    customerBuilding: "",
    customerFloor: "",
    customerFlat: "",
    customerPaciNo: "",
    salesmanId: defaults.salesmanId,
    goldRate: 0,
    netAmount: 0,
    discountAmount: 0,
    scrapAmount: 0,
    remarks: "",
  };
}

/**
 * Maps a scanned item onto a scrap-purchase line. Unlike the sales invoice
 * screen, `rate` is deliberately left at 0 rather than prefilled from the
 * item's retail `salePrice` — the buy-back rate for scrap gold has nothing
 * to do with what the shop would sell that item for, so prefilling it would
 * be actively misleading. The cashier enters the actual buy-back rate.
 */
export function lineItemFromScan(item: InvoiceItemResponse, lineNo: number): LineItemDraft {
  const parsedPurity = Number.parseFloat(item.goldPurity) || 0;
  const netWeight = Math.max(item.grossWeight - item.stoneWeight, 0);
  const pureWeight = parsedPurity > 0 ? netWeight * (parsedPurity / 999) : netWeight;

  return {
    key: nextKey("scrap-item"),
    lineNo,
    itemId: item.itemId,
    barcode: item.barcode,
    itemDescription: item.itemName,
    transactionTypeId: 1,
    makingTypeId: 1,
    goldPurity: parsedPurity,
    quantity: 1,
    goldWeight: item.grossWeight,
    stoneWeight: item.stoneWeight,
    goldNetWeight: netWeight,
    goldPureWeight: pureWeight,
    goldRate: 0,
    makingRate: 0,
    makingCost: 0,
    rate: 0,
    amount: 0,
    makingAmount: 0,
    goldAmount: 0,
    stoneAmount: item.stoneValue,
    taxPercentage: 0,
    deductionWeight: 0,
    deductionPercentage: 0,
    repairFlag: false,
    repairWeight: 0,
  };
}

export function recalculateLine(line: LineItemDraft): LineItemDraft {
  const goldAmount = round2(line.quantity * line.rate);
  const amount = round2(goldAmount + line.makingAmount + line.stoneAmount);
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

export interface ScrapTotals {
  grossWeight: number;
  goldAmount: number;
  makingAmount: number;
  stoneAmount: number;
  subtotal: number;
}

export function calculateTotals(items: LineItemDraft[]): ScrapTotals {
  const totals = items.reduce(
    (acc, line) => {
      acc.grossWeight += line.goldWeight;
      acc.goldAmount += line.goldAmount;
      acc.makingAmount += line.makingAmount;
      acc.stoneAmount += line.stoneAmount;
      acc.subtotal += line.amount;
      return acc;
    },
    { grossWeight: 0, goldAmount: 0, makingAmount: 0, stoneAmount: 0, subtotal: 0 },
  );
  return {
    grossWeight: round2(totals.grossWeight),
    goldAmount: round2(totals.goldAmount),
    makingAmount: round2(totals.makingAmount),
    stoneAmount: round2(totals.stoneAmount),
    subtotal: round2(totals.subtotal),
  };
}

// Payments are reused directly from the sales module — ScrapPurchasePaymentRequest
// is field-for-field identical to SalesInvoicePaymentRequest.
export { paymentsReducer, emptyPayment, type PaymentDraft } from "@/modules/sales/invoice-form";

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
