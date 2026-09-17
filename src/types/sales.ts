// Mirrors Matrix.Api/Models/SalesInvoices/*.cs

export interface SalesInvoiceHeaderRequest {
  invoiceDate: string; // ISO 8601
  invoiceType: number;
  invoiceAgainst: number;
  referenceNo: string;
  partyType: number;
  customerId: string;
  customerName: string;
  customerNameArabic: string;
  customerAddress1: string;
  customerAddress2: string;
  customerPhone: string;
  customerMobile: string;
  customerCivilId: string;
  customerCrNo: string;
  customerAreaCode: string;
  customerCountryCode: string;
  customerBlock: string;
  customerJaddah: string;
  customerStreet: string;
  customerBuilding: string;
  customerFloor: string;
  customerFlat: string;
  customerPaciNo: string;
  salesmanId: string;
  currencyId: string;
  exchangeRate: number;
  totalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  itemDiscountAmount: number;
  netAmount: number;
  taxAmount: number;
  makingAmount: number;
  goldAmount: number;
  grossWeight: number;
  pureWeight: number;
  goldRate: number;
  marketGoldRate: number;
  stoneWeight: number;
  stoneAmount: number;
  deliveryCharge: number;
  giftCharge: number;
  otherCharge1: number;
  otherCharge2: number;
  remarks: string;
  remarks2: string;
  /** Confirms the legacy App_3000CashFlag=1 rolling-cash-limit warning. */
  cashLimitConfirmed: boolean;
}

export interface SalesInvoiceItemRequest {
  lineNo: number;
  itemId: string;
  barcode: string;
  itemDescription: string;
  invoiceItemDescription: string;
  serialNo: string;
  origin: string;
  size: string;
  transactionTypeId: number;
  makingTypeId: number;
  goldPurity: number;
  quantity: number;
  goldWeight: number;
  stoneWeight: number;
  customerGoldWeight: number;
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
  wasteAmount: number;
  taxPercentage: number;
  deductionWeight: number;
  deductionPercentage: number;
  repairFlag: boolean;
  repairWeight: number;
}

export interface SalesInvoicePaymentRequest {
  lineNo: number;
  paymentTypeId: string;
  amount: number;
  currencyId: string;
  exchangeRate: number;
  currencyAmount: number;
  authorizationCode: string;
  accountNo: string;
  chequeNo: string;
  chequeDate?: string | null;
}

export interface SalesInvoiceRequest {
  header: SalesInvoiceHeaderRequest;
  items: SalesInvoiceItemRequest[];
  payments: SalesInvoicePaymentRequest[];
}

import type { ValidationError } from "./common";
export type { ValidationError };

export interface SalesInvoiceSaveResponse {
  transactionNo: number;
  saved: boolean;
  posted: boolean;
  message: string;
  errors?: ValidationError[] | null;
}
