import type { LineItemDraft } from "./unfixed-form";
import { NumberField } from "@/shared/components/NumberField";

interface UnfixedItemsTableProps {
  items: LineItemDraft[];
  onUpdate: (key: string, patch: Partial<LineItemDraft>) => void;
  onRemove: (key: string) => void;
}

export function UnfixedItemsTable({ items, onUpdate, onRemove }: UnfixedItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink-900/15 py-10 text-center">
        <p className="text-sm text-ink-700/50">No items yet — scan a barcode to add the first line.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-ink-900/10">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-ink-900/10 bg-parchment-100/50 text-left text-xs text-ink-700/60">
            <th className="px-3 py-2 font-medium">Item</th>
            <th className="w-20 px-2 py-2 font-medium">Qty</th>
            <th className="w-24 px-2 py-2 font-medium">Gold wt (g)</th>
            <th className="w-24 px-2 py-2 font-medium">Making rate</th>
            <th className="w-24 px-2 py-2 font-medium">Making amt</th>
            <th className="w-24 px-2 py-2 font-medium">Stone amt</th>
            <th className="w-28 px-3 py-2 text-right font-medium">Amount</th>
            <th className="w-10 px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((line) => (
            <tr key={line.key} className="border-b border-ink-900/5 last:border-0">
              <td className="px-3 py-2">
                <p className="font-medium text-ink-900">{line.itemDescription}</p>
                <p className="text-xs text-ink-700/50">
                  {line.itemId}
                  {line.barcode && line.barcode !== line.itemId ? ` · ${line.barcode}` : ""}
                </p>
              </td>
              <td className="px-2 py-2">
                <NumberField
                  aria-label={`Quantity for ${line.itemDescription}`}
                  value={line.quantity}
                  min={0}
                  step={1}
                  onChange={(quantity) => onUpdate(line.key, { quantity })}
                />
              </td>
              <td className="px-2 py-2">
                <NumberField
                  aria-label={`Gold weight for ${line.itemDescription}`}
                  value={line.goldWeight}
                  step={0.01}
                  onChange={(goldWeight) => onUpdate(line.key, { goldWeight })}
                />
              </td>
              <td className="px-2 py-2">
                <NumberField
                  aria-label={`Making rate for ${line.itemDescription}`}
                  value={line.makingRate}
                  step={0.001}
                  onChange={(makingRate) => onUpdate(line.key, { makingRate })}
                />
              </td>
              <td className="px-2 py-2">
                <NumberField
                  aria-label={`Making amount for ${line.itemDescription}`}
                  value={line.makingAmount}
                  step={0.001}
                  onChange={(makingAmount) => onUpdate(line.key, { makingAmount })}
                />
              </td>
              <td className="px-2 py-2">
                <NumberField
                  aria-label={`Stone amount for ${line.itemDescription}`}
                  value={line.stoneAmount}
                  step={0.001}
                  onChange={(stoneAmount) => onUpdate(line.key, { stoneAmount })}
                />
              </td>
              <td className="tabular px-3 py-2 text-right font-medium text-ink-900">
                {line.amount.toFixed(3)}
              </td>
              <td className="px-2 py-2 text-center">
                <button
                  type="button"
                  onClick={() => onRemove(line.key)}
                  aria-label={`Remove ${line.itemDescription}`}
                  className="text-ink-700/40 hover:text-[#b3432f]"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
