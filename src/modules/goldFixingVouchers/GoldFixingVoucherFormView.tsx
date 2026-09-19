import { useMemo, useReducer, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/shared/components/Button";
import { SelectField } from "@/shared/components/SelectField";
import { NumberField } from "@/shared/components/NumberField";
import { PartyPicker } from "@/modules/unfixedGold/PartyPicker";
import { GoldFixingPaymentsTable } from "./GoldFixingPaymentsTable";
import {
  calculateFixing,
  createEmptyHeader,
  emptyPayment,
  paymentsReducer,
  totalPaymentsOf,
  type PaymentDraft,
} from "./voucher-form";
import type { createGoldFixingVoucherApi } from "./api";
import type { GoldFixingVoucherHeaderRequest, GoldFixingVoucherRequest } from "@/types/goldFixingVouchers";
import type { ValidationError } from "@/types/common";
import type { PartySummaryResponse } from "@/types/catalog";

type Status = "draft" | "saved" | "posted";

interface GoldFixingVoucherFormViewProps {
  title: string;
  subtitle: string;
  partyLabel: string;
  useSearch: (term: string) => { data?: PartySummaryResponse[]; isFetching: boolean };
  api: ReturnType<typeof createGoldFixingVoucherApi>;
}

export function GoldFixingVoucherFormView({
  title,
  subtitle,
  partyLabel,
  useSearch,
  api,
}: GoldFixingVoucherFormViewProps) {
  const auth = useAuthStore((s) => s.auth);
  const lookups = auth.status === "ready" ? auth.lookups : null;
  const context = auth.status === "ready" ? auth.context : null;
  const baseCurrency = context?.companySettings.baseCurrencyId ?? "";
  const basePurePurity = context?.companySettings.basePureGoldPurity ?? 999;

  const [header, setHeader] = useState<GoldFixingVoucherHeaderRequest>(() =>
    createEmptyHeader({ currencyId: baseCurrency, goldPurity: basePurePurity }),
  );
  const [payments, dispatchPayments] = useReducer(paymentsReducer, [] as PaymentDraft[]);
  const [status, setStatus] = useState<Status>("draft");
  const [voucherNo, setVoucherNo] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const calc = useMemo(() => calculateFixing(header, basePurePurity), [header, basePurePurity]);
  const totalPaid = useMemo(() => totalPaymentsOf(payments), [payments]);
  const makingNeedsPayment = header.makingAmount > 0 && payments.length === 0;

  const save = useMutation({
    mutationFn: (request: GoldFixingVoucherRequest) => api.save(request),
    onSuccess: (result) => {
      if (result.saved) {
        setVoucherNo(result.voucherNo);
        setStatus("saved");
        setErrors([]);
      } else {
        setErrors(result.errors ?? []);
      }
    },
  });

  const post = useMutation({
    mutationFn: (no: number) => api.post(no),
    onSuccess: (result) => {
      if (result.posted) {
        setStatus("posted");
        setErrors([]);
      } else {
        setErrors(result.errors ?? []);
      }
    },
  });

  function buildRequest(): GoldFixingVoucherRequest {
    return {
      header,
      payments: payments.map(({ key: _key, ...payment }) => payment),
    };
  }

  function handleSave() {
    save.mutate(buildRequest());
  }

  function startNewVoucher() {
    setHeader(createEmptyHeader({ currencyId: baseCurrency, goldPurity: basePurePurity }));
    dispatchPayments({ type: "reset" });
    setStatus("draft");
    setVoucherNo(null);
    setErrors([]);
  }

  const locked = status !== "draft";

  if (auth.status !== "ready" || !context || !lookups) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{title}</h1>
          <p className="text-sm text-ink-700/60">{subtitle}</p>
        </div>
        {voucherNo && (
          <span className="rounded-full bg-ink-900/5 px-3 py-1 text-xs font-medium text-ink-700">
            Voucher #{voucherNo}
          </span>
        )}
      </div>

      {status === "posted" && (
        <div className="mb-6 rounded-md border border-[#039855]/30 bg-[#039855]/10 p-4">
          <p className="font-medium text-[#027a48]">Voucher #{voucherNo} posted successfully.</p>
          <Button variant="secondary" onClick={startNewVoucher} className="mt-3">
            Start new voucher
          </Button>
        </div>
      )}

      <fieldset disabled={locked} className="flex flex-col gap-6 disabled:opacity-70">
        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70" htmlFor="voucherDate">
              Voucher date
            </label>
            <input
              id="voucherDate"
              type="date"
              value={header.voucherDate.slice(0, 10)}
              onChange={(e) =>
                setHeader((h) => ({ ...h, voucherDate: new Date(`${e.target.value}T00:00:00`).toISOString() }))
              }
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70">Reference no.</label>
            <input
              value={header.referenceNo}
              onChange={(e) => setHeader((h) => ({ ...h, referenceNo: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
        </section>

        <section>
          <PartyPicker
            label={partyLabel}
            value={header.partyId}
            valueLabel={header.partyName}
            useSearch={useSearch}
            placeholder={`Search ${partyLabel.toLowerCase()}s…`}
            onChange={(partyId, partyName) => setHeader((h) => ({ ...h, partyId, partyName: partyName ?? "" }))}
          />
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70">Party phone</label>
            <input
              value={header.partyPhone}
              onChange={(e) => setHeader((h) => ({ ...h, partyPhone: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70">Party civil ID</label>
            <input
              value={header.partyCivilId}
              onChange={(e) => setHeader((h) => ({ ...h, partyCivilId: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
        </section>

        <section className="rounded-md border border-brass-500/30 bg-brass-500/5 p-3">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Gold fixing</h2>
          <div className="grid grid-cols-3 gap-3">
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
            <NumberField
              label="Exchange rate"
              value={header.exchangeRate}
              step={0.0001}
              onChange={(exchangeRate) => setHeader((h) => ({ ...h, exchangeRate }))}
            />
            <NumberField
              label="Gold purity"
              value={header.goldPurity}
              step={0.01}
              onChange={(goldPurity) => setHeader((h) => ({ ...h, goldPurity }))}
            />
            <NumberField
              label="Gold weight (g)"
              value={header.goldWeight}
              step={0.001}
              onChange={(goldWeight) => setHeader((h) => ({ ...h, goldWeight }))}
            />
            <NumberField
              label="Gold rate"
              value={header.goldRate}
              step={0.001}
              onChange={(goldRate) => setHeader((h) => ({ ...h, goldRate }))}
            />
            <NumberField
              label="Making amount"
              value={header.makingAmount}
              step={0.001}
              onChange={(makingAmount) => setHeader((h) => ({ ...h, makingAmount }))}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-1 border-t border-brass-500/20 pt-3 text-sm">
            <span className="text-ink-700/60">
              Pure weight <span className="tabular text-ink-900">{calc.pureWeight.toFixed(3)} g</span>
            </span>
            <span className="text-ink-700/60">
              Gold amount <span className="tabular text-ink-900">{calc.goldAmount.toFixed(3)}</span>
            </span>
            <span className="text-ink-700/60">
              Total <span className="tabular font-medium text-ink-900">{calc.total.toFixed(3)}</span>
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <SelectField
            label="Salesman"
            value={header.salesmanId}
            onChange={(e) => setHeader((h) => ({ ...h, salesmanId: e.target.value }))}
          >
            <option value="">None</option>
            {lookups.salesmen.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70">Supplier invoice no.</label>
            <input
              value={header.supplierInvoiceNo}
              onChange={(e) => setHeader((h) => ({ ...h, supplierInvoiceNo: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Payment lines</h2>
          {makingNeedsPayment && (
            <p className="rounded-md bg-brass-500/10 px-3 py-2 text-xs text-ink-700/80">
              Making amount is greater than zero — per the legacy rule, making charges can't be left on
              credit, so at least one payment line covering it is expected.
            </p>
          )}
          <GoldFixingPaymentsTable
            payments={payments}
            paymentTypes={lookups.paymentTypes}
            onAdd={() => dispatchPayments({ type: "add", payment: emptyPayment(payments.length + 1) })}
            onUpdate={(key, patch) => dispatchPayments({ type: "update", key, patch })}
            onRemove={(key) => dispatchPayments({ type: "remove", key })}
          />
        </section>

        <section className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-700/70">Remarks</label>
          <textarea
            value={header.remarks}
            onChange={(e) => setHeader((h) => ({ ...h, remarks: e.target.value }))}
            rows={2}
            className="rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
          />
        </section>

        <div className="flex items-center justify-between rounded-md border border-ink-900/10 p-4 text-sm">
          <span className="text-ink-700/60">Total paid</span>
          <span className="tabular font-medium text-ink-900">{totalPaid.toFixed(3)}</span>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md border border-[#d92d20]/30 bg-[#d92d20]/5 p-4">
            <p className="mb-2 text-sm font-medium text-[#d92d20]">The voucher couldn't be saved:</p>
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
          <Button onClick={handleSave} loading={save.isPending} disabled={header.goldWeight <= 0}>
            Save voucher
          </Button>
        </div>
      )}

      {status === "saved" && voucherNo && (
        <div className="mt-6 flex items-center justify-between rounded-md border border-ink-900/10 bg-parchment-100/50 p-4">
          <p className="text-sm text-ink-700/70">
            Saved as voucher #{voucherNo}. The API doesn't expose an update endpoint, so the form is
            locked from here — post it to complete the voucher.
          </p>
          <Button onClick={() => post.mutate(voucherNo)} loading={post.isPending}>
            Post voucher
          </Button>
        </div>
      )}
    </div>
  );
}
