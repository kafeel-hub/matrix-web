// Mirrors Matrix.Api/Models/Accounts/AccountModels.cs
// AccountsController is read-only — no create/update/delete.

export interface AccountLookupResponse {
  accountNo: string;
  accountName: string;
  currencyId: string;
  isDefault: boolean;
}

export interface AccountSearchResponse {
  items: AccountLookupResponse[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AccountDetailResponse {
  accountNo: string;
  accountName: string;
  currencyId: string;
  balance: number;
  balanceType: string;
  accountSerialNo: string;
  accountPrefix: string;
  accountGroupCode: string;
  accountLevel: number;
  isPostable: boolean;
  isActive: boolean;
}
