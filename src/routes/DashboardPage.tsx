import { useState } from "react";
import { useAuthStore } from "@/auth/auth-store";
import { useDashboard, useDashboardAnalytics } from "@/modules/dashboard/hooks";
import { StatCard, PositionCard, CashFlowSummaryCard } from "@/modules/dashboard/DashboardCards";
import { MovementTable, PaymentsTable, StockTable } from "@/modules/dashboard/DashboardTables";
import { MetricCard, MixTable } from "@/modules/dashboard/AnalyticsCards";
import { BarChart, AreaChart, RadialGauge, StackedBarChart } from "@/modules/dashboard/Charts";
import { SalesIcon, FinanceIcon, ItemsIcon, PurchaseIcon, PercentIcon } from "@/shared/components/icons";

type Tab = "overview" | "sales" | "cash";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sales", label: "Sales & Purchases" },
  { id: "cash", label: "Cash & Stock" },
];

export function DashboardPage() {
  const auth = useAuthStore((s) => s.auth);
  // Defaults to the last 30 days rather than today/today — the Overview
  // tab's trend charts (net sales by day, making charge sales/profit by
  // day) need more than a single day of data to be worth looking at. The
  // base GET /api/dashboard snapshot still works fine over any range.
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState<Tab>("overview");

  // Both GET /api/dashboard and GET /api/dashboard/analytics require the
  // Finance policy — someone without that module would get a 403 from
  // either, so both only fetch/render for users who actually have it.
  const hasFinance = auth.status === "ready" && auth.modules.finance;
  const dashboard = useDashboard(dateFrom, dateTo, hasFinance);
  const analytics = useDashboardAnalytics(dateFrom, dateTo, hasFinance);

  if (auth.status !== "ready") return null;
  const { context, modules } = auth;

  if (!hasFinance) {
    return (
      <div>
        <h1 className="font-display text-2xl text-ink-900">
          {context.companySettings.currencySymbol ?? ""} Welcome back
        </h1>
        <p className="mt-1 text-ink-700/70">
          Financial year {context.financialYear.yearNo} · {context.financialYear.openStatus}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(Object.keys(modules) as Array<keyof typeof modules>)
            .filter((key) => modules[key])
            .map((key) => (
              <div key={key} className="rounded-lg border border-ink-900/10 bg-parchment-100/40 p-4">
                <p className="text-sm font-medium capitalize text-ink-900">{key}</p>
                <p className="mt-1 text-xs text-ink-700/60">Module enabled</p>
              </div>
            ))}
        </div>
      </div>
    );
  }

  const data = dashboard.data?.ok ? dashboard.data.data : null;
  const stats = analytics.data?.ok ? analytics.data.data : null;
  const currency = context.companySettings.currencySymbol ?? "";
  const money = (value: number) => `${currency ? currency + " " : ""}${value.toFixed(3)}`;
  const loading = dashboard.isLoading || analytics.isLoading;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-700/60">{context.locationName}</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70" htmlFor="dateFrom">
              From
            </label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70" htmlFor="dateTo">
              To
            </label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
        </div>
      </div>

      <nav className="mb-6 flex gap-1 border-b border-ink-900/10 pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? "border-b-2 border-brand-600 text-brand-600" : "text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loading && <p className="text-sm text-ink-700/50">Loading…</p>}

      {dashboard.data && !dashboard.data.ok && (
        <p className="mb-4 rounded-md border border-[#d92d20]/30 bg-[#d92d20]/5 p-4 text-sm text-[#d92d20]">
          {dashboard.data.message}
        </p>
      )}
      {analytics.data && !analytics.data.ok && (
        <p className="mb-4 rounded-md border border-[#d92d20]/30 bg-[#d92d20]/5 p-4 text-sm text-[#d92d20]">
          {analytics.data.message}
        </p>
      )}

      {tab === "overview" && data && stats && (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">
              This period vs. previous period
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <MetricCard
                label="Gross sales"
                metric={stats.previousPeriod.grossSales}
                format={money}
                icon={SalesIcon}
                sparklineValues={stats.salesTrend.map((t) => t.grossSales)}
              />
              <MetricCard
                label="Net sales"
                metric={stats.previousPeriod.netSales}
                format={money}
                icon={FinanceIcon}
                sparklineValues={stats.salesTrend.map((t) => t.netSales)}
              />
              <MetricCard
                label="Sales weight"
                metric={stats.previousPeriod.salesWeight}
                format={(v) => `${v.toFixed(3)} g`}
                icon={ItemsIcon}
              />
              <MetricCard
                label="Sales quantity"
                metric={stats.previousPeriod.salesQuantity}
                format={(v) => v.toFixed(0)}
                icon={PurchaseIcon}
              />
              <MetricCard label="Discount" metric={stats.previousPeriod.discount} format={money} icon={PercentIcon} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
              <h3 className="text-sm font-semibold text-ink-900">Making charge margin</h3>
              <p className="mt-0.5 text-xs text-ink-700/50">This period's margin on making charges</p>
              <div className="mt-4 flex justify-center">
                <RadialGauge
                  percentage={stats.makingCharge.marginPercentage}
                  label="Margin"
                  sublabel={`${money(stats.makingCharge.profit)} profit on ${money(stats.makingCharge.sales)} MC sales`}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-ink-900/10 bg-white p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-ink-900">Net sales trend</h3>
              <p className="mt-0.5 text-xs text-ink-700/50">Net sales for each day in the selected range</p>
              <div className="mt-4">
                <BarChart
                  data={stats.salesTrend.map((t) => ({ label: t.period.slice(5), value: t.netSales }))}
                  valueFormat={money}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-900/10 bg-white p-5">
            <h3 className="text-sm font-semibold text-ink-900">Making charge: sales vs. profit</h3>
            <p className="mt-0.5 text-xs text-ink-700/50">Day-by-day making-charge sales and profit</p>
            <div className="mt-4">
              <AreaChart
                labels={stats.makingCharge.trend.map((t) => t.period.slice(5))}
                series={[
                  { name: "MC sales", color: "#d4af37", values: stats.makingCharge.trend.map((t) => t.sales) },
                  { name: "MC profit", color: "#12b76a", values: stats.makingCharge.trend.map((t) => t.profit) },
                ]}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-900/10 bg-white p-5">
            <h3 className="text-sm font-semibold text-ink-900">Making charge sales breakdown</h3>
            <p className="mt-0.5 text-xs text-ink-700/50">
              Cost and profit stacked — the two add up to making-charge sales each day
            </p>
            <div className="mt-4">
              <StackedBarChart
                labels={stats.makingCharge.trend.map((t) => t.period.slice(5))}
                segments={[
                  { name: "Cost", color: "#f79009", values: stats.makingCharge.trend.map((t) => t.cost) },
                  { name: "Profit", color: "#12b76a", values: stats.makingCharge.trend.map((t) => t.profit) },
                ]}
                valueFormat={money}
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard
              title="Sales summary"
              rows={[
                { label: "K-Net", value: money(data.salesSummary.kNet), negative: data.salesSummary.kNet < 0 },
                { label: "Credit", value: money(data.salesSummary.credit), negative: data.salesSummary.credit < 0 },
                {
                  label: "Exchange gold",
                  value: money(data.salesSummary.exchangeGold),
                  negative: data.salesSummary.exchangeGold < 0,
                },
                {
                  label: "Discount",
                  value: money(data.salesSummary.discount),
                  negative: data.salesSummary.discount < 0,
                },
                {
                  label: "Advance deducted",
                  value: money(data.salesSummary.advanceDeducted),
                  negative: data.salesSummary.advanceDeducted < 0,
                },
              ]}
            />
            <StatCard
              title="Making charge"
              rows={[
                { label: "Sales", value: money(stats.makingCharge.sales), negative: stats.makingCharge.sales < 0 },
                { label: "Cost", value: money(stats.makingCharge.cost), negative: stats.makingCharge.cost < 0 },
                {
                  label: "Profit",
                  value: money(stats.makingCharge.profit),
                  negative: stats.makingCharge.profit < 0,
                },
                {
                  label: "Margin",
                  value: `${stats.makingCharge.marginPercentage.toFixed(1)}%`,
                  negative: stats.makingCharge.marginPercentage < 0,
                },
              ]}
            />
            <StatCard
              title="Management profitability"
              rows={[
                {
                  label: "Making charge profit",
                  value: money(stats.profitability.makingChargeProfit),
                  negative: stats.profitability.makingChargeProfit < 0,
                },
                {
                  label: "Scrap profit",
                  value: money(stats.profitability.scrapProfit),
                  negative: stats.profitability.scrapProfit < 0,
                },
                {
                  label: "Expenses",
                  value: money(stats.profitability.expenses),
                  negative: stats.profitability.expenses < 0,
                },
                {
                  label: "Net profit",
                  value: money(stats.profitability.netProfit),
                  negative: stats.profitability.netProfit < 0,
                },
                {
                  label: "Margin",
                  value: `${stats.profitability.marginPercentage.toFixed(1)}%`,
                  negative: stats.profitability.marginPercentage < 0,
                },
              ]}
            />
            <StatCard
              title="Receipts"
              rows={[
                {
                  label: "Cash received",
                  value: money(data.receipts.cashReceived),
                  negative: data.receipts.cashReceived < 0,
                },
                {
                  label: "K-Net received",
                  value: money(data.receipts.kNetReceived),
                  negative: data.receipts.kNetReceived < 0,
                },
              ]}
            />
            <StatCard
              title="Outflows"
              rows={[
                {
                  label: "Cash purchase",
                  value: money(data.outflows.cashPurchase),
                  negative: data.outflows.cashPurchase < 0,
                },
                { label: "Payments", value: money(data.outflows.payments), negative: data.outflows.payments < 0 },
                {
                  label: "K-Net payments",
                  value: money(data.outflows.kNetPayments),
                  negative: data.outflows.kNetPayments < 0,
                },
                { label: "Expenses", value: money(data.outflows.expenses), negative: data.outflows.expenses < 0 },
              ]}
            />
            <StatCard
              title="Orders"
              rows={[
                { label: "Weight", value: `${data.orders.weight.toFixed(3)} g`, negative: data.orders.weight < 0 },
                { label: "Amount", value: money(data.orders.amount), negative: data.orders.amount < 0 },
              ]}
            />
          </section>
        </div>
      )}

      {tab === "sales" && data && stats && (
        <div className="flex flex-col gap-8">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MovementTable title="Sales" rows={data.sales} />
            <MovementTable title="Purchases" rows={data.purchases} />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MixTable
              title="Sales composition"
              amountLabel="Amount"
              secondaryLabel="Weight (g)"
              rows={stats.salesComposition.map((c) => ({
                key: c.code,
                label: c.description,
                amount: c.amount,
                percentage: c.percentage,
                secondary: c.weight.toFixed(3),
              }))}
            />
            <MixTable
              title="Purchases mix"
              amountLabel="Amount"
              secondaryLabel="Weight (g)"
              rows={stats.purchases.mix.map((m) => ({
                key: m.code,
                label: m.description,
                amount: m.amount,
                percentage: m.amountPercentage,
                secondary: m.weight.toFixed(3),
              }))}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PaymentsTable rows={data.payments} />
            <MixTable
              title="Payment mix"
              amountLabel="Amount"
              rows={stats.paymentMix.map((p) => ({
                key: p.paymentId,
                label: p.paymentName,
                amount: p.amount,
                percentage: p.percentage,
              }))}
            />
          </section>
        </div>
      )}

      {tab === "cash" && data && stats && (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Positions</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <PositionCard title="Cash" position={data.positions.cash} icon={FinanceIcon} />
              <PositionCard title="Bank" position={data.positions.bank} icon={FinanceIcon} />
              <PositionCard title="Gold" position={data.positions.gold} suffix="g" icon={ItemsIcon} />
              <PositionCard title="Cash account" position={data.cashAccount} icon={FinanceIcon} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CashFlowSummaryCard
              totalIn={stats.cashFlow.totalMoneyIn}
              totalOut={stats.cashFlow.totalMoneyOut}
              netMovement={stats.cashFlow.netMovement}
              format={money}
            />
          </section>

          <StockTable rows={data.stock} />
        </div>
      )}
    </div>
  );
}
