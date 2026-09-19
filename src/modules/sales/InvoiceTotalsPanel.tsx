import type { SalesInvoiceHeaderRequest } from "@/types/sales";
import type { InvoiceTotals } from "./invoice-form";
import { NumberField } from "@/shared/components/NumberField";

interface InvoiceTotalsPanelProps {
  header: SalesInvoiceHeaderRequest;
  totals: InvoiceTotals;
  netAmount: number;
  totalPaid: number;
  currencySymbol?: string | null;
  onChange: (patch: Partial<SalesInvoiceHeaderRequest>) => void;
}

export function InvoiceTotalsPanel({
  header,
  totals,
  netAmount,
  totalPaid,
  currencySymbol,
  onChange,
}: InvoiceTotalsPanelProps) {
  const balanceDue = round2(netAmount - totalPaid);

  return (
    <div className="rounded-md border border-ink-900/10 p-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <SummaryRow label="Gross weight" value={`${totals.grossWeight.toFixed(3)} g`} />
        <SummaryRow label="Pure weight" value={`${totals.pureWeight.toFixed(3)} g`} />
        <SummaryRow label="Gold amount" value={money(totals.goldAmount, currencySymbol)} />
        <SummaryRow label="Making amount" value={money(totals.makingAmount, currencySymbol)} />
        <SummaryRow label="Stone amount" value={money(totals.stoneAmount, currencySymbol)} />
        <SummaryRow label="Tax" value={money(totals.taxAmount, currencySymbol)} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-900/10 pt-4">
        <NumberField
          label="Discount amount"
          value={header.discountAmount}
          step={0.001}
          onChange={(discountAmount) => onChange({ discountAmount })}
        />
        <NumberField
          label="Delivery charge"
          value={header.deliveryCharge}
          step={0.001}
          onChange={(deliveryCharge) => onChange({ deliveryCharge })}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-900/10 pt-4">
        <span className="font-display text-lg text-ink-900">Net amount</span>
        <span className="tabular font-display text-lg text-ink-900">
          {money(netAmount, currencySymbol)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-ink-700/60">Paid</span>
        <span className="tabular text-ink-700/60">{money(totalPaid, currencySymbol)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={balanceDue > 0 ? "font-medium text-[#d92d20]" : "text-ink-700/60"}>
          {balanceDue > 0 ? "Balance due" : balanceDue < 0 ? "Overpaid" : "Balance"}
        </span>
        <span className={`tabular ${balanceDue !== 0 ? "font-medium text-[#d92d20]" : "text-ink-700/60"}`}>
          {money(Math.abs(balanceDue), currencySymbol)}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-700/60">{label}</span>
      <span className="tabular text-ink-900">{value}</span>
    </div>
  );
}

function money(value: number, symbol?: string | null) {
  return `${symbol ? symbol + " " : ""}${value.toFixed(3)}`;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
