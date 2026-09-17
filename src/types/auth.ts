// Mirrors Matrix.Api/Models/AuthModels.cs exactly (camelCase on the wire,
// System.Text.Json with DefaultIgnoreCondition.WhenWritingNull — so any of
// the optional fields below may simply be absent, not just null).

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface SelectContextRequest {
  preAuthToken: string;
  companyId: number; // byte 1..255
  locationId: number; // byte 1..255
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserInfo {
  userNo: string;
  userName: string;
  loginName: string;
  groupNo: number;
  groupName: string;
  email?: string | null;
  posFlag: number;
  editFlag: number;
  stockAccessFlag: number;
  nonBrandFlag: number;
  discountPercent: number;
  viewPreviousEntry: number;
}

export interface LocationInfo {
  locationId: number;
  locationName: string;
}

export interface CompanyInfo {
  companyId: number;
  companyName: string;
  locations: LocationInfo[];
}

export interface FinancialYearInfo {
  yearNo: number;
  startDate?: string | null;
  endDate?: string | null;
  openDate?: string | null;
  openStatus?: string | null;
}

export interface CompanySettingsInfo {
  nameArabic?: string | null;
  baseCurrencyId?: string | null;
  baseCurrencyName?: string | null;
  baseCurrencyDigit: number;
  basePureGoldPurity: number;
  metalSymbol?: string | null;
  currencySymbol?: string | null;
  defaultDateFormat?: string | null;
}

export interface LocationSettingsInfo {
  nameArabic?: string | null;
  shortName?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
}

export interface ContextInfo {
  companyId: number;
  companyName: string;
  locationId: number;
  locationName: string;
  financialYear: FinancialYearInfo;
  companySettings: CompanySettingsInfo;
  locationSettings: LocationSettingsInfo;
}

export interface ModuleAccessInfo {
  administration: boolean;
  files: boolean;
  finance: boolean;
  inventory: boolean;
  purchases: boolean;
  sales: boolean;
  fixedAssets: boolean;
  tools: boolean;
}

export interface LookupItem {
  id: string;
  name: string;
  nameArb?: string | null;
}

export interface PaymentTypeLookupItem extends LookupItem {
  typeFlag?: number | null;
}

export interface CurrencyLookupItem extends LookupItem {
  rate?: number | null;
  decimalPlaces?: number | null;
}

export interface BootstrapLookups {
  salesmen: LookupItem[];
  paymentTypes: PaymentTypeLookupItem[];
  areas: LookupItem[];
  nationalities: LookupItem[];
  currencies: CurrencyLookupItem[];
}

// The single shared response shape for both /login and /select-context.
// `succeeded` is always present; almost everything else is conditional on
// which branch the API took, so treat this as a discriminated blob and
// narrow on `succeeded` / `requiresContextSelection` (see auth-store.ts).
export interface LoginResponse {
  succeeded: boolean;
  error?: string | null;
  requiresContextSelection: boolean;
  preAuthToken?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  refreshTokenExpiresAtUtc?: string | null;
  accessTokenExpiresAtUtc?: string | null;
  user?: UserInfo | null;
  context?: ContextInfo | null;
  modules?: ModuleAccessInfo | null;
  lookups?: BootstrapLookups | null;
  companies: CompanyInfo[];
}

export interface RefreshResponse {
  succeeded: boolean;
  error?: string | null;
  accessToken?: string | null;
  accessTokenExpiresAtUtc?: string | null;
  refreshToken?: string | null;
  refreshTokenExpiresAtUtc?: string | null;
}

export interface MeResponse {
  tenantId: string;
  userNo: string;
  userName: string;
  groupNo: number;
  companyId: number;
  locationId: number;
}

export interface LogoutResponse {
  succeeded: boolean;
  message: string;
}
