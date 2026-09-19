// Mirrors Matrix.Api/Models/Dashboard/DashboardModels.cs — confirmed
// field-for-field against a real GET /api/dashboard response, not just the
// C# record signatures.

export interface DashboardMovement {
  code: string;
  description: string;
  purity: number;
  quantity: number;
  weight: number;
  amount: number;
}

export interface DashboardPayment {
  paymentId: string;
  paymentName: string;
  amount: number;
}

export interface DashboardStockPosition {
  code: string;
  description: string;
  opening: number;
  debit: number;
  credit: number;
  closing: number;
}

export interface DashboardCashPosition {
  opening: number;
  debit: number;
  credit: number;
  closing: number;
}

export interface DashboardSalesSummary {
  kNet: number;
  credit: number;
  exchangeGold: number;
  discount: number;
  advanceDeducted: number;
}

export interface DashboardScrapPurchase {
  weight: number;
  pureWeight: number;
  value: number;
  cost: number;
  profit: number;
}

export interface DashboardReceipts {
  cashReceived: number;
  kNetReceived: number;
}

export interface DashboardOutflows {
  cashPurchase: number;
  payments: number;
  kNetPayments: number;
  expenses: number;
}

export interface DashboardGoldPurchases {
  fixedWeight: number;
  fixedAmount: number;
  fixingWeight: number;
  fixingAmount: number;
}

export interface DashboardOrders {
  weight: number;
  amount: number;
}

export interface DashboardPositions {
  cash: DashboardCashPosition;
  bank: DashboardCashPosition;
  gold: DashboardCashPosition;
}

export interface DashboardResponse {
  dateFrom: string;
  dateTo: string;
  sales: DashboardMovement[];
  purchases: DashboardMovement[];
  payments: DashboardPayment[];
  salesSummary: DashboardSalesSummary;
  scrapPurchase: DashboardScrapPurchase;
  receipts: DashboardReceipts;
  outflows: DashboardOutflows;
  goldPurchases: DashboardGoldPurchases;
  orders: DashboardOrders;
  positions: DashboardPositions;
  stock: DashboardStockPosition[];
  cashAccount: DashboardCashPosition;
}
