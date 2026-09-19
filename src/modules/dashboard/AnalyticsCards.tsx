import type { DashboardAnalyticsMetric } from "@/types/dashboardAnalytics";
import { Sparkline } from "./Charts";

interface MetricCardProps {
  label: string;
  metric: DashboardAnalyticsMetric;
  format: (value: number) => string;
  icon: (props: { className?: string }) => JSX.Element;
  sparklineValues?: number[];
}

/**
 * The icon-square / big-value / trend-pill card pattern from the
 * reference screenshot (TailAdmin's "Customers"/"Orders" cards) — same
 * comparison data as KpiCard below, different visual treatment.
 * sparklineValues is optional — only pass it where a trend series
 * actually exists for that metric.
 */
export function MetricCard({ label, metric, format, icon: IconComponent, sparklineValues }: MetricCardProps) {
  const isUp = (metric.changePercent ?? 0) >= 0;
  const hasComparison = metric.changePercent !== null;

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900/5">
          <IconComponent className="h-6 w-6 text-ink-700" />
        </span>
        {sparklineValues && sparklineValues.length >= 2 && (
          <Sparkline values={sparklineValues} color={isUp ? "#12b76a" : "#f04438"} />
        )}
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-ink-700/60">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-900">{format(metric.current)}</p>
        </div>
        {hasComparison && (
          <span
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              isUp ? "bg-success-100 text-success-700" : "bg-error-100 text-error-700"
            }`}
          >
            {isUp ? "▲" : "▼"} {Math.abs(metric.changePercent ?? 0).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  metric: DashboardAnalyticsMetric;
  format: (value: number) => string;
}

/**
 * Shows a KPI's current-period value plus its change vs the previous
 * period of equal length (DashboardAnalyticsComparison — the API computes
 * the previous period's date range itself, not just the delta). Green/up
 * for a positive change, red/down for negative; changePercent is null
 * when the previous period was zero (nothing to compare against).
 */
export function KpiCard({ label, metric, format }: KpiCardProps) {
  const isUp = (metric.changePercent ?? 0) >= 0;
  const hasComparison = metric.changePercent !== null;

  return (
    <div className="rounded-md border border-ink-900/10 p-4">
      <p className="text-xs font-medium text-ink-700/60">{label}</p>
      <p className="mt-1.5 font-display text-xl text-ink-900">{format(metric.current)}</p>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {hasComparison ? (
          <span className={isUp ? "text-[#027a48]" : "text-[#d92d20]"}>
            {isUp ? "▲" : "▼"} {Math.abs(metric.changePercent ?? 0).toFixed(1)}%
          </span>
        ) : (
          <span className="text-ink-700/40">—</span>
        )}
        <span className="text-ink-700/50">vs {format(metric.previous)} last period</span>
      </div>
    </div>
  );
}

interface MixRow {
  key: string;
  label: string;
  amount: number;
  percentage: number;
  secondary?: string; // e.g. weight, for rows that carry more than one figure
}

interface MixTableProps {
  title: string;
  rows: MixRow[];
  amountLabel: string;
  secondaryLabel?: string;
}

/**
 * Shared table for paymentMix / salesComposition / purchases.mix — all
 * three are "amount + percentage of total, per category" in shape, so one
 * component covers them rather than three near-identical tables. The
 * percentage renders as a small inline bar, not a separate chart — this
 * app has no charting library installed, and a bar-in-a-table-cell is a
 * clean fit for "percent of a whole" without adding one just for this.
 */
export function MixTable({ title, rows, amountLabel, secondaryLabel }: MixTableProps) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-ink-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-900/15 py-6 text-center text-sm text-ink-700/50">
          No activity in this range.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs text-ink-700/60">
                <th className="py-2 font-medium">Type</th>
                {secondaryLabel && <th className="py-2 text-right font-medium">{secondaryLabel}</th>}
                <th className="py-2 text-right font-medium">{amountLabel}</th>
                <th className="py-2 font-medium">% of total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-ink-900/5 last:border-0">
                  <td className="py-2.5 text-ink-900">{row.label}</td>
                  {secondaryLabel && (
                    <td className="tabular py-2.5 text-right text-ink-700/70">{row.secondary}</td>
                  )}
                  <td className="tabular py-2.5 text-right font-semibold text-ink-900">
                    {row.amount.toFixed(3)}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-900/10">
                        <div
                          className="h-full rounded-full bg-brass-500"
                          style={{ width: `${Math.min(row.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="tabular text-xs text-ink-700/60">{row.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
