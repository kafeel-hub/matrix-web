import { useMemo, useReducer, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/shared/components/Button";
import { SelectField } from "@/shared/components/SelectField";
import { NumberField } from "@/shared/components/NumberField";
import { CustomerPicker } from "@/modules/sales/CustomerPicker";
import { ItemScanInput } from "@/modules/sales/ItemScanInput";
import { LineItemsTable } from "@/modules/sales/LineItemsTable";
import { PaymentsPanel } from "@/modules/sales/PaymentsPanel";
import { InvoiceTotalsPanel } from "@/modules/sales/InvoiceTotalsPanel";
import {
  calculateTotals,
  createEmptyReturnHeader,
  emptyPayment,
  lineItemFromScan,
  lineItemsReducer,
  paymentsReducer,
  type LineItemDraft,
  type PaymentDraft,
} from "@/modules/salesReturns/return-form";
import * as returnApi from "@/modules/salesReturns/api";
import type { SalesReturnHeaderRequest, SalesReturnRequest } from "@/types/salesReturns";
import type { ValidationError } from "@/types/common";

type Status = "draft" | "saved" | "posted";

export function NewSalesReturnPage() {
  const auth = useAuthStore((s) => s.auth);
  // See NewSaleInvoicePage.tsx for why every hook below runs unconditionally
  // and the real early-return guard sits after all of them.
  const lookups = auth.status === "ready" ? auth.lookups : null;
  const context = auth.status === "ready" ? auth.context : null;
  const defaultSalesman = lookups?.salesmen[0]?.id ?? "";
  const baseCurrency = context?.companySettings.baseCurrencyId ?? "";

  const [header, setHeader] = useState<SalesReturnHeaderRequest>(() =>
    createEmptyReturnHeader({ currencyId: baseCurrency, salesmanId: defaultSalesman }),
  );
  const [items, dispatchItems] = useReducer(lineItemsReducer, [] as LineItemDraft[]);
  const [payments, dispatchPayments] = useReducer(paymentsReducer, [] as PaymentDraft[]);
  const [status, setStatus] = useState<Status>("draft");
  const [transactionNo, setTransactionNo] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const totals = useMemo(() => calculateTotals(items), [items]);
  const netAmount = useMemo(
    () =>
      round2(
        totals.totalAmount +
          totals.taxAmount -
          header.discountAmount -
          header.itemDiscountAmount +
          header.deliveryCharge +
          header.giftCharge +
          header.otherCharge1 +
          header.otherCharge2,
      ),
    [totals, header],
  );
  const totalPaid = useMemo(() => round2(payments.reduce((sum, p) => sum + p.amount, 0)), [payments]);

  const cashLimitError = errors.find((e) => /cash/i.test(e.message));

  const save = useMutation({
    mutationFn: (request: SalesReturnRequest) => returnApi.saveSalesReturn(request),
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
    mutationFn: (txnNo: number) => returnApi.postSalesReturn(txnNo),
    onSuccess: (result) => {
      if (result.posted) {
        setStatus("posted");
        setErrors([]);
      } else {
        setErrors(result.errors ?? []);
      }
    },
  });

  function buildRequest(): SalesReturnRequest {
    return {
      header: {
        ...header,
        totalAmount: totals.totalAmount,
        taxAmount: totals.taxAmount,
        makingAmount: totals.makingAmount,
        goldAmount: totals.goldAmount,
        grossWeight: totals.grossWeight,
        pureWeight: totals.pureWeight,
        stoneWeight: totals.stoneWeight,
        stoneAmount: totals.stoneAmount,
        netAmount,
      },
      items: items.map(({ key: _key, ...item }) => item),
      payments: payments.map(({ key: _key, ...payment }) => payment),
    };
  }

  function handleSave() {
    save.mutate(buildRequest());
  }

  function confirmCashLimitAndResave() {
    setHeader((h) => ({ ...h, cashLimitConfirmed: true }));
    const request = buildRequest();
    save.mutate({ ...request, header: { ...request.header, cashLimitConfirmed: true } });
  }

  function startNewReturn() {
    setHeader(createEmptyReturnHeader({ currencyId: baseCurrency, salesmanId: defaultSalesman }));
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
          <h1 className="font-display text-2xl text-ink-900">Sales return</h1>
          <p className="text-sm text-ink-700/60">{context.locationName}</p>
        </div>
        {transactionNo && (
          <span className="rounded-full bg-ink-900/5 px-3 py-1 text-xs font-medium text-ink-700">
            Return #{transactionNo}
          </span>
        )}
      </div>

      {status === "posted" && (
        <div className="mb-6 rounded-md border border-[#039855]/30 bg-[#039855]/10 p-4">
          <p className="font-medium text-[#027a48]">Return #{transactionNo} posted successfully.</p>
          <Button variant="secondary" onClick={startNewReturn} className="mt-3">
            Start new return
          </Button>
        </div>
      )}

      <fieldset disabled={locked} className="flex flex-col gap-6 disabled:opacity-70">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Customer</h2>
          <CustomerPicker header={header} onChange={(patch) => setHeader((h) => ({ ...h, ...patch }))} />
        </section>

        <section className="flex flex-col gap-3 rounded-md border border-brass-500/30 bg-brass-500/5 p-3">
          <h2 className="text-sm font-semibold text-ink-900">Original invoice</h2>
          <p className="text-xs text-ink-700/60">
            Which sale is this return against? This links the return back to the original invoice.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Original invoice year"
              value={header.originalInvoiceYear}
              onChange={(originalInvoiceYear) => setHeader((h) => ({ ...h, originalInvoiceYear }))}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-700/70">Original invoice no.</label>
              <input
                value={header.originalInvoiceNo}
                onChange={(e) => setHeader((h) => ({ ...h, originalInvoiceNo: e.target.value }))}
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-700/70">Original invoice date</label>
              <input
                type="date"
                value={header.originalInvoiceDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setHeader((h) => ({
                    ...h,
                    originalInvoiceDate: e.target.value
                      ? new Date(`${e.target.value}T00:00:00`).toISOString()
                      : null,
                  }))
                }
                className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70" htmlFor="invoiceDate">
              Return date
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
          <SelectField
            label="Currency"
            value={header.currencyId}
            onChange={(e) => setHeader((h) => ({ ...h, currencyId: e.target.value }))}
          >
            {lookups.currencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.name}
              </option>
            ))}
          </SelectField>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Items being returned</h2>
          <ItemScanInput
            nextLineNo={items.length + 1}
            onItemFound={(item, lineNo) => {
              if (!item) return;
              dispatchItems({ type: "add", line: lineItemFromScan(item, lineNo) });
            }}
          />
          <LineItemsTable
            items={items}
            onUpdate={(key, patch) => dispatchItems({ type: "update", key, patch })}
            onRemove={(key) => dispatchItems({ type: "remove", key })}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Refund / payment</h2>
          <PaymentsPanel
            payments={payments}
            paymentTypes={lookups.paymentTypes}
            onAdd={() =>
              dispatchPayments({
                type: "add",
                payment: emptyPayment(payments.length + 1, header.currencyId),
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

        <InvoiceTotalsPanel
          header={header}
          totals={totals}
          netAmount={netAmount}
          totalPaid={totalPaid}
          currencySymbol={context.companySettings.currencySymbol}
          onChange={(patch) => setHeader((h) => ({ ...h, ...patch }))}
        />

        {errors.length > 0 && (
          <div className="rounded-md border border-[#d92d20]/30 bg-[#d92d20]/5 p-4">
            <p className="mb-2 text-sm font-medium text-[#d92d20]">The return couldn't be saved:</p>
            <ul className="list-inside list-disc text-sm text-[#d92d20]">
              {errors.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
            {cashLimitError && (
              <Button variant="secondary" onClick={confirmCashLimitAndResave} className="mt-3">
                Confirm and save anyway
              </Button>
            )}
          </div>
        )}
      </fieldset>

      {status === "draft" && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={save.isPending} disabled={items.length === 0}>
            Save return
          </Button>
        </div>
      )}

      {status === "saved" && transactionNo && (
        <div className="mt-6 flex items-center justify-between rounded-md border border-ink-900/10 bg-parchment-100/50 p-4">
          <p className="text-sm text-ink-700/70">
            Saved as return #{transactionNo}. The API doesn't expose an update endpoint, so the form is
            locked from here — post it to complete the return.
          </p>
          <Button onClick={() => post.mutate(transactionNo)} loading={post.isPending}>
            Post return
          </Button>
        </div>
      )}
    </div>
  );
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
