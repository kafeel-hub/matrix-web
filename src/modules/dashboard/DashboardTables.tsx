import type { DashboardMovement, DashboardPayment, DashboardStockPosition } from "@/types/dashboard";

export function MovementTable({ title, rows }: { title: string; rows: DashboardMovement[] }) {
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
                <th className="py-2 font-medium">Purity</th>
                <th className="py-2 text-right font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Weight (g)</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.code} className="border-b border-ink-900/5 last:border-0">
                  <td className="py-2.5 text-ink-900">{row.description}</td>
                  <td className="tabular py-2.5 text-ink-700/70">{row.purity}</td>
                  <td className="tabular py-2.5 text-right text-ink-700/70">{row.quantity}</td>
                  <td className="tabular py-2.5 text-right text-ink-700/70">{row.weight.toFixed(3)}</td>
                  <td className="tabular py-2.5 text-right font-semibold text-ink-900">
                    {row.amount.toFixed(3)}
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

export function PaymentsTable({ rows }: { rows: DashboardPayment[] }) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-ink-900">Payment method mix</h3>
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-900/15 py-6 text-center text-sm text-ink-700/50">
          No payments in this range.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs text-ink-700/60">
                <th className="py-2 font-medium">Method</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.paymentId} className="border-b border-ink-900/5 last:border-0">
                  <td className="py-2.5 text-ink-900">{row.paymentName}</td>
                  <td className="tabular py-2.5 text-right font-semibold text-ink-900">
                    {row.amount.toFixed(3)}
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

export function StockTable({ rows }: { rows: DashboardStockPosition[] }) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-ink-900">Stock position</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 text-left text-xs text-ink-700/60">
              <th className="py-2 font-medium">Category</th>
              <th className="py-2 text-right font-medium">Opening</th>
              <th className="py-2 text-right font-medium">Debit</th>
              <th className="py-2 text-right font-medium">Credit</th>
              <th className="py-2 pl-4 font-medium">Movement</th>
              <th className="py-2 text-right font-medium">Closing</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const barMax = Math.max(row.debit, row.credit, 1);
              const isNegative = row.closing < 0;
              return (
                <tr key={row.code} className="border-b border-ink-900/5 last:border-0">
                  <td className="py-2.5 text-ink-900">{row.description}</td>
                  <td className="tabular py-2.5 text-right text-ink-700/70">{row.opening.toFixed(3)}</td>
                  <td className="tabular py-2.5 text-right text-ink-700/70">{row.debit.toFixed(3)}</td>
                  <td className="tabular py-2.5 text-right text-ink-700/70">{row.credit.toFixed(3)}</td>
                  <td className="py-2.5 pl-4">
                    <div className="flex h-1.5 w-20 gap-0.5 overflow-hidden rounded-full bg-ink-900/5">
                      <div className="h-full bg-success-500" style={{ width: `${(row.debit / barMax) * 50}%` }} />
                      <div className="h-full bg-warning-500" style={{ width: `${(row.credit / barMax) * 50}%` }} />
                    </div>
                  </td>
                  <td
                    className={`tabular py-2.5 text-right font-semibold ${
                      isNegative ? "text-error-600" : "text-ink-900"
                    }`}
                  >
                    {row.closing.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
