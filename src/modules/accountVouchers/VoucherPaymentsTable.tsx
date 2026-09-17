import { useState } from "react";
import type { PaymentDraft } from "./voucher-form";
import type { PaymentTypeLookupItem } from "@/types/auth";
import { NumberField } from "@/shared/components/NumberField";
import { SelectField } from "@/shared/components/SelectField";
import { Button } from "@/shared/components/Button";

interface VoucherPaymentsTableProps {
  payments: PaymentDraft[];
  paymentTypes: PaymentTypeLookupItem[];
  onAdd: () => void;
  onUpdate: (key: string, patch: Partial<PaymentDraft>) => void;
  onRemove: (key: string) => void;
}

export function VoucherPaymentsTable({
  payments,
  paymentTypes,
  onAdd,
  onUpdate,
  onRemove,
}: VoucherPaymentsTableProps) {
  return (
    <div className="flex flex-col gap-3">
      {payments.length === 0 && <p className="text-sm text-ink-700/50">No payment lines yet.</p>}
      {payments.map((payment) => (
        <PaymentRow
          key={payment.key}
          payment={payment}
          paymentTypes={paymentTypes}
          onUpdate={(patch) => onUpdate(payment.key, patch)}
          onRemove={() => onRemove(payment.key)}
        />
      ))}
      <Button type="button" variant="secondary" onClick={onAdd} className="self-start">
        + Add payment
      </Button>
    </div>
  );
}

function PaymentRow({
  payment,
  paymentTypes,
  onUpdate,
  onRemove,
}: {
  payment: PaymentDraft;
  paymentTypes: PaymentTypeLookupItem[];
  onUpdate: (patch: Partial<PaymentDraft>) => void;
  onRemove: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-md border border-ink-900/10 p-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <SelectField
            label="Payment type"
            value={payment.paymentTypeId}
            onChange={(e) => onUpdate({ paymentTypeId: e.target.value })}
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
            onChange={(amount) => onUpdate({ amount, currencyAmount: amount * payment.exchangeRate })}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowDetails((s) => !s)}
          className="pb-1.5 text-xs font-medium text-ink-700/60 underline-offset-2 hover:text-ink-900 hover:underline"
        >
          {showDetails ? "Hide details" : "Reference details"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove payment"
          className="pb-1.5 text-ink-700/40 hover:text-[#b3432f]"
        >
          ✕
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-900/5 pt-3">
          <input
            value={payment.accountNo}
            onChange={(e) => onUpdate({ accountNo: e.target.value })}
            placeholder="Reference account no."
            className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
          />
          <input
            value={payment.chequeBank}
            onChange={(e) => onUpdate({ chequeBank: e.target.value })}
            placeholder="Cheque bank"
            className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
          />
          <input
            value={payment.chequeNo}
            onChange={(e) => onUpdate({ chequeNo: e.target.value })}
            placeholder="Cheque no."
            className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
          />
        </div>
      )}
    </div>
  );
}
