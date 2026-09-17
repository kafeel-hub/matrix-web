import { AccountPicker } from "@/modules/accounts/AccountPicker";
import { NumberField } from "@/shared/components/NumberField";
import type { ExpenseLineDraft } from "./expense-form";

interface ExpenseLinesTableProps {
  lines: ExpenseLineDraft[];
  onAdd: () => void;
  onUpdate: (key: string, patch: Partial<ExpenseLineDraft>) => void;
  onRemove: (key: string) => void;
}

export function ExpenseLinesTable({ lines, onAdd, onUpdate, onRemove }: ExpenseLinesTableProps) {
  return (
    <div className="flex flex-col gap-3">
      {lines.length === 0 && (
        <p className="text-sm text-ink-700/50">No expense lines yet.</p>
      )}
      {lines.map((line) => (
        <div key={line.key} className="rounded-md border border-ink-900/10 p-3">
          <div className="grid grid-cols-[2fr_2fr_1fr_auto] items-end gap-3">
            <AccountPicker
              label="Expense account"
              value={line.accountNo}
              valueLabel={line.accountName}
              onChange={(accountNo, account) =>
                onUpdate(line.key, { accountNo, accountName: account?.accountName ?? "" })
              }
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-700/70">Narration</label>
              <input
                value={line.narration}
                onChange={(e) => onUpdate(line.key, { narration: e.target.value })}
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
            </div>
            <NumberField
              label="Amount"
              value={line.amount}
              step={0.001}
              onChange={(amount) => onUpdate(line.key, { amount })}
            />
            <button
              type="button"
              onClick={() => onRemove(line.key)}
              aria-label="Remove line"
              className="pb-1.5 text-ink-700/40 hover:text-[#b3432f]"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="self-start rounded-md border border-ink-700/25 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-900/5"
      >
        + Add line
      </button>
    </div>
  );
}
