import type { PaymentDraft } from "./unfixed-form";
import type { PaymentTypeLookupItem } from "@/types/auth";
import { NumberField } from "@/shared/components/NumberField";
import { SelectField } from "@/shared/components/SelectField";
import { Button } from "@/shared/components/Button";

interface UnfixedPaymentsTableProps {
  payments: PaymentDraft[];
  paymentTypes: PaymentTypeLookupItem[];
  onAdd: () => void;
  onUpdate: (key: string, patch: Partial<PaymentDraft>) => void;
  onRemove: (key: string) => void;
}

export function UnfixedPaymentsTable({
  payments,
  paymentTypes,
  onAdd,
  onUpdate,
  onRemove,
}: UnfixedPaymentsTableProps) {
  return (
    <div className="flex flex-col gap-3">
      {payments.length === 0 && <p className="text-sm text-ink-700/50">No payment lines yet.</p>}
      {payments.map((payment) => (
        <div key={payment.key} className="flex items-end gap-3 rounded-md border border-ink-900/10 p-3">
          <div className="flex-1">
            <SelectField
              label="Payment type"
              value={payment.paymentTypeId}
              onChange={(e) => onUpdate(payment.key, { paymentTypeId: e.target.value })}
            >
              <option value="">Select…</option>
              {paymentTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="w-32">
            <NumberField
              label="Amount"
              value={payment.amount}
              step={0.001}
              onChange={(amount) =>
                onUpdate(payment.key, { amount, currencyAmount: amount * payment.exchangeRate })
              }
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(payment.key)}
            aria-label="Remove payment"
            className="pb-1.5 text-ink-700/40 hover:text-[#b3432f]"
          >
            ✕
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={onAdd} className="self-start">
        + Add payment
      </Button>
    </div>
  );
}
