export const n = (value) => Number(value || 0);
export const money = (value, digits = 3) => n(value).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const qty = (value, digits = 3) => n(value).toLocaleString(undefined, { maximumFractionDigits: digits });
export const pct = (value) => `${n(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;

const parsePeriod = (period) => {
  if (!period) return null;
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period);
  if (day) return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
  const month = /^(\d{4})-(\d{2})$/.exec(period);
  if (month) return new Date(Number(month[1]), Number(month[2]) - 1, 1);
  return null;
};

export const periodLabel = (period, groupBy = "month") => {
  const date = parsePeriod(period);
  if (!date) return period || "";
  return groupBy === "day"
    ? date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })
    : date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

export const hasNonZero = (values = []) => values.some((value) => Math.abs(n(value)) > 0);

export const chartOptions = (unit = "", tooltipUnit = unit) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { labels: { color: "#9ea3d1", boxWidth: 12, font: { size: 9 } } },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset?.label ? `${context.dataset.label}: ` : "";
          const value = Number(context.parsed?.y ?? context.parsed ?? context.raw ?? 0);
          return `${label}${value.toLocaleString(undefined, { maximumFractionDigits: 3 })}${tooltipUnit ? ` ${tooltipUnit}` : ""}`;
        },
      },
    },
  },
  scales: {
    x: { ticks: { color: "#9ea3d1", maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, grid: { color: "rgba(255,255,255,.04)" } },
    y: { ticks: { color: "#9ea3d1", callback: (v) => `${Number(v).toLocaleString()}${unit}` }, grid: { color: "rgba(255,255,255,.05)" } },
  },
});
