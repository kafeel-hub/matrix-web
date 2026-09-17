// Mirrors Matrix.Api/Models/Items/*.cs and Matrix.Api/Models/Parties/*.cs

export interface ItemLookupResponse {
  itemId: string;
  itemName: string;
}

export interface InvoiceItemResponse {
  itemId: string;
  itemName: string;
  barcode: string;
  goldPurity: string;
  barcodeFlag: number;
  grossWeight: number;
  stoneWeight: number;
  stoneValue: number;
  salePrice: number;
}

export interface CustomerLookupResponse {
  customerId: string;
  civilId: string;
  customerName: string;
  customerNameArabic: string;
  mobileNo: string;
  alternatePhoneNo: string;
  areaId: string;
  nationalityId: string;
}

// Shared by /api/customers and /api/suppliers (Prt_Type 1 vs 2 server-side).
export interface SavePartyRequest {
  name: string;
  nameArabic?: string | null;
  shortName?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  phone?: string | null;
  fax?: string | null;
  civilId?: string | null;
  civilIdType?: number | null;
  civilIdExpiry?: string | null;
  crNo?: string | null;
  crExpiry?: string | null;
  country?: string | null;
  areaId?: string | null;
  currencyId?: string | null;
  creditDays: number;
  creditLimit: number;
  contactPerson?: string | null;
  designation?: string | null;
  glAccountNo?: string | null;
  blackListed: boolean;
  purePurity: number;
  transferCharges: number;
  licenseNo?: string | null;
  civilLicenseNo?: string | null;
  notes?: string | null;
  status: number;
  gender?: string | null;
  dateOfBirth?: string | null;
  kycArea?: string | null;
  kycCountry?: string | null;
  block?: string | null;
  jedah?: string | null;
  street?: string | null;
  building?: string | null;
  floor?: string | null;
  flat?: string | null;
  paciNo?: string | null;
}

export interface PartySummaryResponse {
  partyId: string;
  partyType: string;
  name: string;
  nameArabic?: string | null;
  phone?: string | null;
  civilId?: string | null;
  currencyId?: string | null;
  creditLimit: number;
  blackListed: boolean;
  status: number;
}

export interface PartyDetailResponse extends PartySummaryResponse {
  shortName?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  fax?: string | null;
  civilIdType?: number | null;
  civilIdExpiry?: string | null;
  crNo?: string | null;
  crExpiry?: string | null;
  country?: string | null;
  region?: string | null;
  areaId?: string | null;
  creditDays: number;
  contactPerson?: string | null;
  designation?: string | null;
  glAccountNo?: string | null;
  accountNo?: string | null;
  accountSerialNo?: string | null;
  purePurity: number;
  transferCharges: number;
  licenseNo?: string | null;
  civilLicenseNo?: string | null;
  notes?: string | null;
  locationId: number;
}

import type { ValidationError } from "./common";

export interface PartySaveResponse {
  partyId: string;
  created: boolean;
  message: string;
}

/** 400 body from CustomerController/SupplierController's Save() wrapper. */
export interface PartySaveValidationResponse {
  errors: ValidationError[];
}

/** 409 body — e.g. no active financial year configured. */
export interface PartySaveConflictResponse {
  code: string;
  message: string;
}
