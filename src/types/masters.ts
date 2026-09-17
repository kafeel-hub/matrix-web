// Mirrors Matrix.Api/Models/Masters/MasterModels.cs

export interface MasterSaveResponse {
  id: string;
  created: boolean;
  message: string;
}

export interface PaymentTypeResponse {
  payId: string;
  payName: string;
  payNameArabic?: string | null;
  amountType: number;
  percentage: number;
  amount: number;
  receiptAccountNo?: string | null;
  paymentAccountNo?: string | null;
  typeFlag: number;
  orderNo: number;
  status: number;
  locationId: number;
}
export interface SavePaymentTypeRequest {
  payId: string; // max 2 chars — this is the primary key, typed by hand on create
  payName: string; // max 30
  payNameArabic?: string | null; // max 30
  amountType: number;
  percentage: number;
  amount: number;
  receiptAccountNo?: string | null; // max 25
  paymentAccountNo?: string | null; // max 20
  typeFlag: number;
  orderNo: number;
  status: number;
}

export interface CurrencyResponse {
  currencyId: string;
  name: string;
  nameArabic?: string | null;
  shortName?: string | null;
  prefix?: string | null;
  suffix?: string | null;
  decimalPlaces: number;
}
export interface SaveCurrencyRequest {
  currencyId: string; // max 3 chars, e.g. "KWD"
  name: string; // max 50
  nameArabic?: string | null; // max 50
  prefix?: string | null; // max 5
  suffix?: string | null; // max 5
  decimalPlaces: number; // 0-9
}

export interface CountryResponse {
  countryId: string;
  name: string;
  nameArabic?: string | null;
  prefix?: string | null;
  itemOrigin: number;
  sortOrder?: number | null;
}
export interface SaveCountryRequest {
  countryId: string; // max 2 chars
  name: string; // max 50
  nameArabic?: string | null; // max 50
  prefix?: string | null; // max 15
  itemOrigin: number;
}

export interface SalesmanResponse {
  salesmanId: string;
  name?: string | null;
  nameArabic?: string | null;
  prefix?: string | null;
  commissionPercent: number;
  commissionAccountNo?: string | null;
  locationId?: number | null;
  holdStock: boolean;
  status: number;
}
export interface SaveSalesmanRequest {
  salesmanId: string; // max 3 chars
  name: string; // max 50
  nameArabic?: string | null; // max 50
  prefix?: string | null; // max 5
  commissionPercent: number; // 0-100
  commissionAccountNo?: string | null; // max 30
  locationId?: number | null;
  holdStock: boolean;
  status: number;
}

export interface AreaResponse {
  areaId: string;
  name?: string | null;
  nameArabic?: string | null;
  prefix?: string | null;
  countryId?: string | null;
}
export interface SaveAreaRequest {
  areaId: string; // max 3 chars
  name: string; // max 50
  nameArabic?: string | null; // max 50
  prefix?: string | null; // max 5
  countryId?: string | null; // max 3
}
