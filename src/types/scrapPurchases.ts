// Mirrors Matrix.Api/Models/ScrapPurchases/ScrapPurchaseRequest.cs
//
// Deliberately NOT sharing types with sales invoice here: unlike sales
// returns, ScrapPurchaseItemRequest genuinely differs from
// SalesInvoiceItemRequest (no invoiceItemDescription/serialNo/origin/size/
// customerGoldWeight/wasteAmount), and ScrapPurchaseHeaderRequest is a much
// smaller, walk-in-only shape (no customerId/partyType/currencyId — buying
// scrap gold off the street isn't tied to a master customer record).
// ScrapPurchasePaymentRequest IS identical to SalesInvoicePaymentRequest,
// so that one is reused (see purchase-form.ts).
import type { SalesInvoicePaymentRequest } from "./sales";
import type { ValidationError } from "./common";

export interface ScrapPurchaseHeaderRequest {
  invoiceDate: string;
  invoiceType: number;
  referenceNo: string;
  customerName: string;
  customerCivilId: string;
  customerMobile: string;
  customerPhone: string;
  customerCountryCode: string;
  customerAreaCode: string;
  customerBlock: string;
  customerJaddah: string;
  customerStreet: string;
  customerBuilding: string;
  customerFloor: string;
  customerFlat: string;
  customerPaciNo: string;
  salesmanId: string;
  goldRate: number;
  netAmount: number;
  discountAmount: number;
  scrapAmount: number;
  remarks: string;
}

export interface ScrapPurchaseItemRequest {
  lineNo: number;
  itemId: string;
  barcode: string;
  itemDescription: string;
  transactionTypeId: number;
  makingTypeId: number;
  goldPurity: number;
  quantity: number;
  goldWeight: number;
  stoneWeight: number;
  goldNetWeight: number;
  goldPureWeight: number;
  goldRate: number;
  makingRate: number;
  makingCost: number;
  rate: number;
  amount: number;
  makingAmount: number;
  goldAmount: number;
  stoneAmount: number;
  taxPercentage: number;
  deductionWeight: number;
  deductionPercentage: number;
  repairFlag: boolean;
  repairWeight: number;
}

export interface ScrapPurchaseRequest {
  header: ScrapPurchaseHeaderRequest;
  items: ScrapPurchaseItemRequest[];
  payments: SalesInvoicePaymentRequest[]; // identical shape, reused
}

export interface ScrapPurchaseSaveResponse {
  transactionNo: number;
  saved: boolean;
  posted: boolean;
  message: string;
  errors?: ValidationError[] | null;
}
