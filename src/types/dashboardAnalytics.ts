// Mirrors Matrix.Api/Models/Dashboard/DashboardAnalyticsModels.cs (v23).
// Distinct from types/dashboard.ts (the original lightweight GET
// /api/dashboard snapshot, unchanged since v21/v22) — DashboardPage.tsx
// fetches both and combines them, since neither alone covers everything:
// this endpoint has no scrap-specific breakdown, no gold inventory
// position, and no "credit sales" figure (not a payment method, so it
// can't appear in paymentMix) — those three still come from the snapshot.

export interface DashboardAnalyticsMetric {
  current: number;
  previous: number;
  changePercent: number | null;
}

export interface DashboardAnalyticsKpis {
  grossSales: number;
  netSales: number;
  salesWeight: number;
  salesQuantity: number;
  discount: number;
}

export interface DashboardAnalyticsComparison {
  dateFrom: string;
  dateTo: string;
  grossSales: DashboardAnalyticsMetric;
  netSales: DashboardAnalyticsMetric;
  salesWeight: DashboardAnalyticsMetric;
  salesQuantity: DashboardAnalyticsMetric;
  discount: DashboardAnalyticsMetric;
}

export interface DashboardSalesTrendPoint {
  period: string;
  grossSales: number;
  netSales: number;
  weight: number;
  quantity: number;
  discount: number;
}

export interface DashboardAnalyticsPayment {
  paymentId: string;
  paymentName: string;
  amount: number;
  percentage: number;
}

export interface DashboardSalesComposition {
  code: string;
  description: string;
  purity: number;
  quantity: number;
  weight: number;
  amount: number;
  percentage: number;
}

export interface DashboardPurchaseMix {
  code: string;
  description: string;
  weight: number;
  amount: number;
  weightPercentage: number;
  amountPercentage: number;
}

export interface DashboardPurchaseTrendPoint {
  period: string;
  scrapWeight: number;
  scrapAmount: number;
  fixedWeight: number;
  fixedAmount: number;
  fixingWeight: number;
  fixingAmount: number;
  totalWeight: number;
  totalAmount: number;
}

export interface DashboardPurchaseAnalytics {
  totalWeight: number;
  totalAmount: number;
  mix: DashboardPurchaseMix[];
  trend: DashboardPurchaseTrendPoint[];
}

export interface DashboardCashFlowAnalytics {
  cashOpening: number;
  cashIn: number;
  cashOut: number;
  cashClosing: number;
  bankOpening: number;
  bankIn: number;
  bankOut: number;
  bankClosing: number;
  totalMoneyIn: number;
  totalMoneyOut: number;
  netMovement: number;
}

export interface DashboardBalanceTrendPoint {
  period: string;
  cashOpening: number;
  cashIn: number;
  cashOut: number;
  cashClosing: number;
  bankOpening: number;
  bankIn: number;
  bankOut: number;
  bankClosing: number;
  goldOpening: number;
  goldIn: number;
  goldOut: number;
  goldClosing: number;
}

export interface DashboardMakingChargeComparison {
  sales: DashboardAnalyticsMetric;
  cost: DashboardAnalyticsMetric;
  profit: DashboardAnalyticsMetric;
}

export interface DashboardMakingChargeTrendPoint {
  period: string;
  sales: number;
  cost: number;
  profit: number;
  marginPercentage: number;
}

export interface DashboardMakingChargeAnalytics {
  sales: number;
  cost: number;
  profit: number;
  marginPercentage: number;
  previousPeriod: DashboardMakingChargeComparison;
  trend: DashboardMakingChargeTrendPoint[];
}

export interface DashboardManagementProfitabilityComparison {
  makingChargeProfit: DashboardAnalyticsMetric;
  scrapProfit: DashboardAnalyticsMetric;
  expenses: DashboardAnalyticsMetric;
  netProfit: DashboardAnalyticsMetric;
}

export interface DashboardManagementProfitabilityTrendPoint {
  period: string;
  makingChargeProfit: number;
  scrapProfit: number;
  expenses: number;
  netProfit: number;
  marginPercentage: number;
}

export interface DashboardManagementProfitabilityAnalytics {
  makingChargeProfit: number;
  scrapProfit: number;
  expenses: number;
  netProfit: number;
  marginPercentage: number;
  previousPeriod: DashboardManagementProfitabilityComparison;
  trend: DashboardManagementProfitabilityTrendPoint[];
}

export interface DashboardAnalyticsResponse {
  dateFrom: string;
  dateTo: string;
  groupBy: string;
  kpis: DashboardAnalyticsKpis;
  previousPeriod: DashboardAnalyticsComparison;
  salesTrend: DashboardSalesTrendPoint[];
  paymentMix: DashboardAnalyticsPayment[];
  salesComposition: DashboardSalesComposition[];
  purchases: DashboardPurchaseAnalytics;
  cashFlow: DashboardCashFlowAnalytics;
  makingCharge: DashboardMakingChargeAnalytics;
  profitability: DashboardManagementProfitabilityAnalytics;
  balanceTrend: DashboardBalanceTrendPoint[];
}
