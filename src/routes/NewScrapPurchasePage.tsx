import { useMemo, useReducer, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/shared/components/Button";
import { SelectField } from "@/shared/components/SelectField";
import { NumberField } from "@/shared/components/NumberField";
import { ItemScanInput } from "@/modules/sales/ItemScanInput";
import { ScrapItemsTable } from "@/modules/scrapPurchases/ScrapItemsTable";
import { PaymentsPanel } from "@/modules/sales/PaymentsPanel";
import {
  calculateTotals,
  createEmptyHeader,
  lineItemFromScan,
  lineItemsReducer,
  paymentsReducer,
  emptyPayment,
  type LineItemDraft,
  type PaymentDraft,
} from "@/modules/scrapPurchases/purchase-form";
import * as scrapApi from "@/modules/scrapPurchases/api";
import type { ScrapPurchaseHeaderRequest, ScrapPurchaseRequest } from "@/types/scrapPurchases";
import type { ValidationError } from "@/types/common";

type Status = "draft" | "saved" | "posted";

export function NewScrapPurchasePage() {
  const auth = useAuthStore((s) => s.auth);
  const lookups = auth.status === "ready" ? auth.lookups : null;
  const context = auth.status === "ready" ? auth.context : null;
  const defaultSalesman = lookups?.salesmen[0]?.id ?? "";
  const baseCurrency = context?.companySettings.baseCurrencyId ?? "";

  const [header, setHeader] = useState<ScrapPurchaseHeaderRequest>(() =>
    createEmptyHeader({ salesmanId: defaultSalesman }),
  );
  const [items, dispatchItems] = useReducer(lineItemsReducer, [] as LineItemDraft[]);
  const [payments, dispatchPayments] = useReducer(paymentsReducer, [] as PaymentDraft[]);
  const [status, setStatus] = useState<Status>("draft");
  const [transactionNo, setTransactionNo] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const totals = useMemo(() => calculateTotals(items), [items]);
  // Deliberate assumption: netAmount = subtotal - discount. `scrapAmount` is
  // carried on the header (and sent to the API) but not folded into this
  // formula — its exact role (a fee? a deduction already reflected in line
  // rates?) isn't clear from the DTO alone, so it's left as a field the
  // cashier fills in rather than silently guessing its sign. See README.
  const netAmount = useMemo(
    () => round2(totals.subtotal - header.discountAmount),
    [totals, header.discountAmount],
  );
  const totalPaid = useMemo(() => round2(payments.reduce((sum, p) => sum + p.amount, 0)), [payments]);

  const cashLimitError = errors.find((e) => /cash/i.test(e.message));

  const save = useMutation({
    mutationFn: (request: ScrapPurchaseRequest) => scrapApi.saveScrapPurchase(request),
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
    mutationFn: (txnNo: number) => scrapApi.postScrapPurchase(txnNo),
    onSuccess: (result) => {
      if (result.posted) {
        setStatus("posted");
        setErrors([]);
      } else {
        setErrors(result.errors ?? []);
      }
    },
  });

  function buildRequest(): ScrapPurchaseRequest {
    return {
      header: { ...header, netAmount },
      items: items.map(({ key: _key, ...item }) => item),
      payments: payments.map(({ key: _key, ...payment }) => payment),
    };
  }

  function handleSave() {
    save.mutate(buildRequest());
  }

  function startNewPurchase() {
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
          <h1 className="font-display text-2xl text-ink-900">Scrap purchase</h1>
          <p className="text-sm text-ink-700/60">{context.locationName}</p>
        </div>
        {transactionNo && (
          <span className="rounded-full bg-ink-900/5 px-3 py-1 text-xs font-medium text-ink-700">
            Purchase #{transactionNo}
          </span>
        )}
      </div>

      {status === "posted" && (
        <div className="mb-6 rounded-md border border-[#4c7a4a]/30 bg-[#4c7a4a]/10 p-4">
          <p className="font-medium text-[#3c6339]">Purchase #{transactionNo} posted successfully.</p>
          <Button variant="secondary" onClick={startNewPurchase} className="mt-3">
            Start new purchase
          </Button>
        </div>
      )}

      <fieldset disabled={locked} className="flex flex-col gap-6 disabled:opacity-70">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Seller details</h2>
          <p className="text-xs text-ink-700/50">
            Scrap purchases aren't tied to a customer master record — just the seller's details for this
            transaction.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-700/70">Name</label>
              <input
                value={header.customerName}
                onChange={(e) => setHeader((h) => ({ ...h, customerName: e.target.value }))}
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-700/70">Civil ID</label>
              <input
                value={header.customerCivilId}
                onChange={(e) => setHeader((h) => ({ ...h, customerCivilId: e.target.value }))}
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-700/70">Mobile</label>
              <input
                value={header.customerMobile}
                onChange={(e) => setHeader((h) => ({ ...h, customerMobile: e.target.value }))}
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
            </div>
            <SelectField
              label="Area"
              value={header.customerAreaCode}
              onChange={(e) => setHeader((h) => ({ ...h, customerAreaCode: e.target.value }))}
            >
              <option value="">Select…</option>
              {lookups.areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </SelectField>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70" htmlFor="invoiceDate">
              Purchase date
            </label>
            <input
              id="invoiceDate"
              type="date"
              value={header.invoiceDate.slice(0, 10)}
              onChange={(e) =>
                setHeader((h) => ({ ...h, invoiceDate: new Date(`${e.target.value}T00:00:00`).toISOString() }))
              }
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
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
            label="Today's gold rate"
            value={header.goldRate}
            step={0.001}
            onChange={(goldRate) => setHeader((h) => ({ ...h, goldRate }))}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Items purchased</h2>
          <ItemScanInput
            nextLineNo={items.length + 1}
            onItemFound={(item, lineNo) => {
              if (!item) return;
              dispatchItems({ type: "add", line: lineItemFromScan(item, lineNo) });
            }}
          />
          <ScrapItemsTable
            items={items}
            onUpdate={(key, patch) => dispatchItems({ type: "update", key, patch })}
            onRemove={(key) => dispatchItems({ type: "remove", key })}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Payment to seller</h2>
          <PaymentsPanel
            payments={payments}
            paymentTypes={lookups.paymentTypes}
            onAdd={() =>
              dispatchPayments({
                type: "add",
                payment: emptyPayment(payments.length + 1, baseCurrency),
              })
            }
            onUpdate={(key, patch) => dispatchPayments({ type: "update", key, patch })}
            onRemove={(key) => dispatchPayments({ type: "remove", key })}
          />
        </section>

        <section>
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className="text-xs font-medium text-ink-700/60 underline-offset-2 hover:text-ink-900 hover:underline"
          >
            {showAdvanced ? "Hide additional details" : "Additional details"}
          </button>
          {showAdvanced && (
            <div className="mt-3 grid grid-cols-2 gap-3 rounded-md border border-ink-900/10 p-3">
              <input
                value={header.referenceNo}
                onChange={(e) => setHeader((h) => ({ ...h, referenceNo: e.target.value }))}
                placeholder="Reference no."
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
              <input
                value={header.customerPhone}
                onChange={(e) => setHeader((h) => ({ ...h, customerPhone: e.target.value }))}
                placeholder="Alternate phone"
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
              <input
                value={header.customerBlock}
                onChange={(e) => setHeader((h) => ({ ...h, customerBlock: e.target.value }))}
                placeholder="Block"
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
              <input
                value={header.customerStreet}
                onChange={(e) => setHeader((h) => ({ ...h, customerStreet: e.target.value }))}
                placeholder="Street"
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
              <input
                value={header.customerBuilding}
                onChange={(e) => setHeader((h) => ({ ...h, customerBuilding: e.target.value }))}
                placeholder="Building"
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
              <textarea
                value={header.remarks}
                onChange={(e) => setHeader((h) => ({ ...h, remarks: e.target.value }))}
                placeholder="Remarks"
                rows={2}
                className="col-span-2 rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
            </div>
          )}
        </section>

        <div className="rounded-md border border-ink-900/10 p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <SummaryRow label="Gross weight" value={`${totals.grossWeight.toFixed(3)} g`} />
            <SummaryRow label="Gold amount" value={totals.goldAmount.toFixed(3)} />
            <SummaryRow label="Making amount" value={totals.makingAmount.toFixed(3)} />
            <SummaryRow label="Stone amount" value={totals.stoneAmount.toFixed(3)} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-900/10 pt-4">
            <NumberField
              label="Discount amount"
              value={header.discountAmount}
              step={0.001}
              onChange={(discountAmount) => setHeader((h) => ({ ...h, discountAmount }))}
            />
            <NumberField
              label="Scrap amount"
              value={header.scrapAmount}
              step={0.001}
              onChange={(scrapAmount) => setHeader((h) => ({ ...h, scrapAmount }))}
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
          <div className="rounded-md border border-[#b3432f]/30 bg-[#b3432f]/5 p-4">
            <p className="mb-2 text-sm font-medium text-[#b3432f]">The purchase couldn't be saved:</p>
            <ul className="list-inside list-disc text-sm text-[#b3432f]">
              {errors.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
            {cashLimitError && <p className="mt-2 text-xs text-[#b3432f]">Review the cash limit before retrying.</p>}
          </div>
        )}
      </fieldset>

      {status === "draft" && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={save.isPending} disabled={items.length === 0}>
            Save purchase
          </Button>
        </div>
      )}

      {status === "saved" && transactionNo && (
        <div className="mt-6 flex items-center justify-between rounded-md border border-ink-900/10 bg-parchment-100/50 p-4">
          <p className="text-sm text-ink-700/70">
            Saved as purchase #{transactionNo}. The API doesn't expose an update endpoint, so the form is
            locked from here — post it to complete the purchase.
          </p>
          <Button onClick={() => post.mutate(transactionNo)} loading={post.isPending}>
            Post purchase
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
