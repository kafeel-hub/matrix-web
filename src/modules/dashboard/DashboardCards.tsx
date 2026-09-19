interface StatCardProps {
  title: string;
  rows: { label: string; value: string; negative?: boolean }[];
}

export function StatCard({ title, rows }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <div className="mt-3 flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-ink-700/60">{row.label}</span>
            <span className={`tabular ${row.negative ? "font-medium text-error-600" : "text-ink-900"}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CashFlowSummaryCardProps {
  totalIn: number;
  totalOut: number;
  netMovement: number;
  format: (value: number) => string;
}

export function CashFlowSummaryCard({ totalIn, totalOut, netMovement, format }: CashFlowSummaryCardProps) {
  const isNegative = netMovement < 0;
  const barMax = Math.max(totalIn, totalOut, 1);

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
      <h3 className="text-sm font-semibold text-ink-900">Cash flow summary</h3>

      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-700/50">Total money in</span>
          <span className="tabular font-medium text-success-700">{format(totalIn)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink-900/5">
          <div className="h-full rounded-full bg-success-500" style={{ width: `${(totalIn / barMax) * 100}%` }} />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-ink-700/50">Total money out</span>
          <span className="tabular font-medium text-error-700">{format(totalOut)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink-900/5">
          <div className="h-full rounded-full bg-error-500" style={{ width: `${(totalOut / barMax) * 100}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-900/10 pt-3">
        <span className="text-xs text-ink-700/50">Net movement</span>
        <span className={`tabular text-lg font-bold ${isNegative ? "text-error-600" : "text-success-700"}`}>
          {format(netMovement)}
        </span>
      </div>
    </div>
  );
}

interface PositionCardProps {
  title: string;
  position: { opening: number; debit: number; credit: number; closing: number };
  suffix?: string; // e.g. "g" for gold weight-based positions
  icon?: (props: { className?: string }) => JSX.Element;
}

/**
 * Debit is treated as money/stock coming in (green), credit as going out
 * (amber) — the standard convention for these asset-style positions
 * (cash, bank, gold, stock). The comparison bar is scaled to whichever of
 * the two is larger, so it always shows the true relative split rather
 * than clipping. Closing balance is colored red when negative — e.g. a
 * gold position going negative (sold more than currently held/purchased)
 * is meaningful information worth surfacing at a glance, not just another
 * number in the row.
 */
export function PositionCard({ title, position, suffix = "", icon: IconComponent }: PositionCardProps) {
  const fmt = (n: number) => `${n.toFixed(3)}${suffix ? ` ${suffix}` : ""}`;
  const isNegative = position.closing < 0;
  const barMax = Math.max(position.debit, position.credit, 1);

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {IconComponent && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900/5">
            <IconComponent className="h-4.5 w-4.5 text-ink-700" />
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-700/50">Debit</span>
          <span className="tabular text-ink-700/70">{fmt(position.debit)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-900/5">
          <div
            className="h-full rounded-full bg-success-500"
            style={{ width: `${(position.debit / barMax) * 100}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-ink-700/50">Credit</span>
          <span className="tabular text-ink-700/70">{fmt(position.credit)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-900/5">
          <div
            className="h-full rounded-full bg-warning-500"
            style={{ width: `${(position.credit / barMax) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-900/10 pt-3">
        <span className="text-xs text-ink-700/50">Opening {fmt(position.opening)}</span>
        <div className="text-right">
          <p className="text-[11px] text-ink-700/50">Closing</p>
          <p className={`tabular text-lg font-bold ${isNegative ? "text-error-600" : "text-ink-900"}`}>
            {fmt(position.closing)}
          </p>
        </div>
      </div>
    </div>
  );
}
