import { useMemo, useReducer, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/shared/components/Button";
import { SelectField } from "@/shared/components/SelectField";
import { NumberField } from "@/shared/components/NumberField";
import { AccountPicker } from "@/modules/accounts/AccountPicker";
import { VoucherPaymentsTable } from "@/modules/accountVouchers/VoucherPaymentsTable";
import { createEmptyHeader, emptyPayment, paymentsReducer, totalOf, type PaymentDraft } from "./voucher-form";
import type { createGoldVoucherApi } from "./api";
import type { GoldAccountVoucherHeaderRequest, GoldAccountVoucherRequest } from "@/types/goldAccountVouchers";
import type { ValidationError } from "@/types/common";

type Status = "draft" | "saved" | "posted";

interface GoldVoucherFormViewProps {
  title: string;
  subtitle: string;
  accountLabel: string;
  api: ReturnType<typeof createGoldVoucherApi>;
  showPayGoldFields: boolean;
}

export function GoldVoucherFormView({
  title,
  subtitle,
  accountLabel,
  api,
  showPayGoldFields,
}: GoldVoucherFormViewProps) {
  const auth = useAuthStore((s) => s.auth);
  const lookups = auth.status === "ready" ? auth.lookups : null;
  const context = auth.status === "ready" ? auth.context : null;
  const baseCurrency = context?.companySettings.baseCurrencyId ?? "";

  const [header, setHeader] = useState<GoldAccountVoucherHeaderRequest>(createEmptyHeader);
  const [accountName, setAccountName] = useState("");
  const [payments, dispatchPayments] = useReducer(paymentsReducer, [] as PaymentDraft[]);
  const [status, setStatus] = useState<Status>("draft");
  const [voucherNo, setVoucherNo] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const total = useMemo(() => totalOf(payments), [payments]);
  const netAmount = useMemo(() => round2(total - header.discountAmount), [total, header.discountAmount]);

  const save = useMutation({
    mutationFn: (request: GoldAccountVoucherRequest) => api.save(request),
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

  function buildRequest(): GoldAccountVoucherRequest {
    return {
      header,
      payments: payments.map(({ key: _key, ...payment }) => payment),
    };
  }

  function handleSave() {
    save.mutate(buildRequest());
  }

  function startNewVoucher() {
    setHeader(createEmptyHeader());
    setAccountName("");
    dispatchPayments({ type: "reset" });
    setStatus("draft");
    setVoucherNo(null);
    setErrors([]);
  }

  function setFixedGoldWeight(fixedGoldWeight: number) {
    setHeader((h) => ({ ...h, fixedGoldWeight, fixedGoldAmount: round2(fixedGoldWeight * h.fixedGoldRate) }));
  }
  function setFixedGoldRate(fixedGoldRate: number) {
    setHeader((h) => ({ ...h, fixedGoldRate, fixedGoldAmount: round2(h.fixedGoldWeight * fixedGoldRate) }));
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
        <div className="mb-6 rounded-md border border-[#4c7a4a]/30 bg-[#4c7a4a]/10 p-4">
          <p className="font-medium text-[#3c6339]">Voucher #{voucherNo} posted successfully.</p>
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
            <label className="text-xs font-medium text-ink-700/70">Manual no.</label>
            <input
              value={header.manualNo}
              onChange={(e) => setHeader((h) => ({ ...h, manualNo: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
        </section>

        <section>
          <AccountPicker
            label={accountLabel}
            value={header.accountNo}
            valueLabel={accountName}
            onChange={(accountNo, account) => {
              setHeader((h) => ({ ...h, accountNo }));
              setAccountName(account?.accountName ?? "");
            }}
          />
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70">Paid to / received from (name)</label>
            <input
              value={header.paidTo}
              onChange={(e) => setHeader((h) => ({ ...h, paidTo: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
          <SelectField
            label="Salesman"
            value={header.salesman}
            onChange={(e) => setHeader((h) => ({ ...h, salesman: e.target.value }))}
          >
            <option value="">None</option>
            {lookups.salesmen.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70">Civil ID</label>
            <input
              value={header.civilId}
              onChange={(e) => setHeader((h) => ({ ...h, civilId: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70">Phone no.</label>
            <input
              value={header.phoneNo}
              onChange={(e) => setHeader((h) => ({ ...h, phoneNo: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
        </section>

        <section className="rounded-md border border-brass-500/30 bg-brass-500/5 p-3">
          <h2 className="mb-1 text-sm font-semibold text-ink-900">Gold fixing</h2>
          <p className="mb-3 text-xs text-ink-700/60">
            Recorded at purity 999 regardless of what's entered here — the legacy posting procedure hard-codes
            it.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Fixed gold weight (g)"
              value={header.fixedGoldWeight}
              step={0.001}
              onChange={setFixedGoldWeight}
            />
            <NumberField
              label="Fixed gold rate"
              value={header.fixedGoldRate}
              step={0.001}
              onChange={setFixedGoldRate}
            />
            <NumberField
              label="Fixed gold amount"
              value={header.fixedGoldAmount}
              step={0.001}
              onChange={(fixedGoldAmount) => setHeader((h) => ({ ...h, fixedGoldAmount }))}
            />
          </div>

          {showPayGoldFields && (
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-brass-500/20 pt-3">
              <NumberField
                label="Pay-gold purity"
                value={header.payGoldPurity}
                step={0.001}
                onChange={(payGoldPurity) => setHeader((h) => ({ ...h, payGoldPurity }))}
              />
              <NumberField
                label="Pay-gold weight (g)"
                value={header.payGoldWeight}
                step={0.001}
                onChange={(payGoldWeight) => setHeader((h) => ({ ...h, payGoldWeight }))}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-700/70">Pay-gold remarks</label>
                <input
                  value={header.payGoldRemarks}
                  onChange={(e) => setHeader((h) => ({ ...h, payGoldRemarks: e.target.value }))}
                  className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
                />
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Payment lines</h2>
          <VoucherPaymentsTable
            payments={payments}
            paymentTypes={lookups.paymentTypes}
            onAdd={() =>
              dispatchPayments({ type: "add", payment: emptyPayment(payments.length + 1, baseCurrency) })
            }
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

        <div className="rounded-md border border-ink-900/10 p-4">
          <NumberField
            label="Discount amount"
            value={header.discountAmount}
            step={0.001}
            onChange={(discountAmount) => setHeader((h) => ({ ...h, discountAmount }))}
          />
          <div className="mt-4 flex items-center justify-between border-t border-ink-900/10 pt-4">
            <span className="font-display text-lg text-ink-900">Net amount</span>
            <span className="tabular font-display text-lg text-ink-900">{netAmount.toFixed(3)}</span>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md border border-[#b3432f]/30 bg-[#b3432f]/5 p-4">
            <p className="mb-2 text-sm font-medium text-[#b3432f]">The voucher couldn't be saved:</p>
            <ul className="list-inside list-disc text-sm text-[#b3432f]">
              {errors.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
          </div>
        )}
      </fieldset>

      {status === "draft" && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={save.isPending} disabled={payments.length === 0}>
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

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
