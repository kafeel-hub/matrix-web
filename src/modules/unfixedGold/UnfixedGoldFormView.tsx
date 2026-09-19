import { useMemo, useReducer, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/shared/components/Button";
import { SelectField } from "@/shared/components/SelectField";
import { NumberField } from "@/shared/components/NumberField";
import { ItemScanInput } from "@/modules/sales/ItemScanInput";
import { PartyPicker } from "./PartyPicker";
import { UnfixedItemsTable } from "./UnfixedItemsTable";
import { UnfixedPaymentsTable } from "./UnfixedPaymentsTable";
import {
  calculateTotals,
  createEmptyHeader,
  emptyPayment,
  lineItemFromScan,
  lineItemsReducer,
  paymentsReducer,
  type LineItemDraft,
  type PaymentDraft,
} from "./unfixed-form";
import type { createUnfixedGoldApi } from "./api";
import type { UnfixedGoldHeaderRequest, UnfixedGoldRequest } from "@/types/unfixedGold";
import type { ValidationError } from "@/types/common";
import type { PartySummaryResponse } from "@/types/catalog";

type Status = "draft" | "saved" | "posted";

interface UnfixedGoldFormViewProps {
  title: string;
  subtitle: string;
  partyLabel: string;
  useSearch: (term: string) => { data?: PartySummaryResponse[]; isFetching: boolean };
  api: ReturnType<typeof createUnfixedGoldApi>;
}

export function UnfixedGoldFormView({ title, subtitle, partyLabel, useSearch, api }: UnfixedGoldFormViewProps) {
  const auth = useAuthStore((s) => s.auth);
  const lookups = auth.status === "ready" ? auth.lookups : null;
  const context = auth.status === "ready" ? auth.context : null;
  const baseCurrency = context?.companySettings.baseCurrencyId ?? "";
  const defaultSalesman = lookups?.salesmen[0]?.id ?? "";

  const [header, setHeader] = useState<UnfixedGoldHeaderRequest>(() =>
    createEmptyHeader({ salesmanId: defaultSalesman }),
  );
  const [items, dispatchItems] = useReducer(lineItemsReducer, [] as LineItemDraft[]);
  const [payments, dispatchPayments] = useReducer(paymentsReducer, [] as PaymentDraft[]);
  const [status, setStatus] = useState<Status>("draft");
  const [transactionNo, setTransactionNo] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const totals = useMemo(() => calculateTotals(items), [items]);
  const netAmount = useMemo(
    () => round2(totals.subtotal + header.taxAmount - header.discountAmount),
    [totals, header.taxAmount, header.discountAmount],
  );
  const totalPaid = useMemo(() => round2(payments.reduce((sum, p) => sum + p.amount, 0)), [payments]);

  const save = useMutation({
    mutationFn: (request: UnfixedGoldRequest) => api.save(request),
    onSuccess: (result) => {
      if (result.saved) {
        setTransactionNo(result.transactionNo);
        setStatus("saved");
        setErrors([]);
      } else {
        setErrors(result.errors ?? []);
      }
    },
  });

  const post = useMutation({
    mutationFn: (txnNo: number) => api.post(txnNo),
    onSuccess: (result) => {
      if (result.posted) {
        setStatus("posted");
        setErrors([]);
      } else {
        setErrors(result.errors ?? []);
      }
    },
  });

  function buildRequest(): UnfixedGoldRequest {
    return {
      header: { ...header, netAmount },
      items: items.map(({ key: _key, ...item }) => item),
      payments: payments.map(({ key: _key, ...payment }) => payment),
    };
  }

  function handleSave() {
    save.mutate(buildRequest());
  }

  function startNewTransaction() {
    setHeader(createEmptyHeader({ salesmanId: defaultSalesman }));
    dispatchItems({ type: "reset" });
    dispatchPayments({ type: "reset" });
    setStatus("draft");
    setTransactionNo(null);
    setErrors([]);
  }

  const locked = status !== "draft";

  if (auth.status !== "ready" || !context || !lookups) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{title}</h1>
          <p className="text-sm text-ink-700/60">{subtitle}</p>
        </div>
        {transactionNo && (
          <span className="rounded-full bg-ink-900/5 px-3 py-1 text-xs font-medium text-ink-700">
            #{transactionNo}
          </span>
        )}
      </div>

      {status === "posted" && (
        <div className="mb-6 rounded-md border border-[#039855]/30 bg-[#039855]/10 p-4">
          <p className="font-medium text-[#027a48]">#{transactionNo} posted successfully.</p>
          <Button variant="secondary" onClick={startNewTransaction} className="mt-3">
            Start new transaction
          </Button>
        </div>
      )}

      <fieldset disabled={locked} className="flex flex-col gap-6 disabled:opacity-70">
        <section className="grid grid-cols-2 gap-3">
          <PartyPicker
            label={partyLabel}
            value={header.partyId}
            valueLabel={header.partyName}
            useSearch={useSearch}
            placeholder={`Search ${partyLabel.toLowerCase()}s…`}
            onChange={(partyId, partyName) => setHeader((h) => ({ ...h, partyId, partyName: partyName ?? "" }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70" htmlFor="transactionDate">
              Transaction date
            </label>
            <input
              id="transactionDate"
              type="date"
              value={header.transactionDate.slice(0, 10)}
              onChange={(e) =>
                setHeader((h) => ({
                  ...h,
                  transactionDate: new Date(`${e.target.value}T00:00:00`).toISOString(),
                }))
              }
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <SelectField
            label="Salesman"
            value={header.salesmanId}
            onChange={(e) => setHeader((h) => ({ ...h, salesmanId: e.target.value }))}
          >
            <option value="">Select…</option>
            {lookups.salesmen.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <NumberField
            label="Credit days"
            value={header.creditDays}
            onChange={(creditDays) => setHeader((h) => ({ ...h, creditDays }))}
          />
          <NumberField
            label="Pure gold purity"
            value={header.pureGoldPurity}
            step={0.01}
            onChange={(pureGoldPurity) => setHeader((h) => ({ ...h, pureGoldPurity }))}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Items</h2>
          <ItemScanInput
            nextLineNo={items.length + 1}
            onItemFound={(item, lineNo) => {
              if (!item) return;
              dispatchItems({ type: "add", line: lineItemFromScan(item, lineNo) });
            }}
          />
          <UnfixedItemsTable
            items={items}
            onUpdate={(key, patch) => dispatchItems({ type: "update", key, patch })}
            onRemove={(key) => dispatchItems({ type: "remove", key })}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Payments</h2>
          <UnfixedPaymentsTable
            payments={payments}
            paymentTypes={lookups.paymentTypes}
            onAdd={() =>
              dispatchPayments({ type: "add", payment: emptyPayment(payments.length + 1, baseCurrency) })
            }
            onUpdate={(key, patch) => dispatchPayments({ type: "update", key, patch })}
            onRemove={(key) => dispatchPayments({ type: "remove", key })}
          />
        </section>

        <section className="grid grid-cols-2 gap-3">
          <input
            value={header.referenceNo}
            onChange={(e) => setHeader((h) => ({ ...h, referenceNo: e.target.value }))}
            placeholder="Reference no."
            className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
          />
          <textarea
            value={header.remarks}
            onChange={(e) => setHeader((h) => ({ ...h, remarks: e.target.value }))}
            placeholder="Remarks"
            rows={2}
            className="col-span-2 rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
          />
        </section>

        <div className="rounded-md border border-ink-900/10 p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <SummaryRow label="Gold weight" value={`${totals.goldWeight.toFixed(3)} g`} />
            <SummaryRow label="Making amount" value={totals.makingAmount.toFixed(3)} />
            <SummaryRow label="Stone amount" value={totals.stoneAmount.toFixed(3)} />
            <SummaryRow label="Subtotal" value={totals.subtotal.toFixed(3)} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-900/10 pt-4">
            <NumberField
              label="Discount amount"
              value={header.discountAmount}
              step={0.001}
              onChange={(discountAmount) => setHeader((h) => ({ ...h, discountAmount }))}
            />
            <NumberField
              label="Tax amount"
              value={header.taxAmount}
              step={0.001}
              onChange={(taxAmount) => setHeader((h) => ({ ...h, taxAmount }))}
            />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink-900/10 pt-4">
            <span className="font-display text-lg text-ink-900">Net amount</span>
            <span className="tabular font-display text-lg text-ink-900">{netAmount.toFixed(3)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink-700/60">Paid</span>
            <span className="tabular text-ink-700/60">{totalPaid.toFixed(3)}</span>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md border border-[#d92d20]/30 bg-[#d92d20]/5 p-4">
            <p className="mb-2 text-sm font-medium text-[#d92d20]">This couldn't be saved:</p>
            <ul className="list-inside list-disc text-sm text-[#d92d20]">
              {errors.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
          </div>
        )}
      </fieldset>

      {status === "draft" && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={save.isPending} disabled={items.length === 0}>
            Save
          </Button>
        </div>
      )}

      {status === "saved" && transactionNo && (
        <div className="mt-6 flex items-center justify-between rounded-md border border-ink-900/10 bg-parchment-100/50 p-4">
          <p className="text-sm text-ink-700/70">
            Saved as #{transactionNo}. The API doesn't expose an update endpoint, so the form is locked
            from here — post it to complete the transaction.
          </p>
          <Button onClick={() => post.mutate(transactionNo)} loading={post.isPending}>
            Post
          </Button>
        </div>
      )}
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

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
