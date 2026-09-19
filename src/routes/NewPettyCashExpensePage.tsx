import { useMemo, useReducer, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { CashAccountSelect } from "@/modules/accounts/CashAccountSelect";
import { usePettyCashAccounts } from "@/modules/accounts/hooks";
import { ExpenseLinesTable } from "@/modules/pettyCash/ExpenseLinesTable";
import {
  createEmptyHeader,
  emptyLine,
  linesReducer,
  totalOf,
  type ExpenseLineDraft,
} from "@/modules/pettyCash/expense-form";
import * as pettyCashApi from "@/modules/pettyCash/api";
import type { PettyCashExpenseHeaderRequest, PettyCashExpenseRequest } from "@/types/pettyCash";
import type { ValidationError } from "@/types/common";

type Status = "draft" | "saved" | "posted";

export function NewPettyCashExpensePage() {
  const pettyCashAccounts = usePettyCashAccounts();

  const [header, setHeader] = useState<PettyCashExpenseHeaderRequest>(createEmptyHeader);
  const [lines, dispatchLines] = useReducer(linesReducer, [] as ExpenseLineDraft[]);
  const [status, setStatus] = useState<Status>("draft");
  const [voucherNo, setVoucherNo] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const total = useMemo(() => totalOf(lines), [lines]);

  const save = useMutation({
    mutationFn: (request: PettyCashExpenseRequest) => pettyCashApi.savePettyCashExpense(request),
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
    mutationFn: (no: number) => pettyCashApi.postPettyCashExpense(no),
    onSuccess: (result) => {
      if (result.posted) {
        setStatus("posted");
        setErrors([]);
      } else {
        setErrors(result.errors ?? []);
      }
    },
  });

  function buildRequest(): PettyCashExpenseRequest {
    return {
      header,
      items: lines.map(({ key: _key, accountName: _accountName, ...line }) => line),
    };
  }

  function handleSave() {
    save.mutate(buildRequest());
  }

  function startNewVoucher() {
    setHeader(createEmptyHeader());
    dispatchLines({ type: "reset" });
    setStatus("draft");
    setVoucherNo(null);
    setErrors([]);
  }

  const locked = status !== "draft";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Petty cash expense</h1>
          <p className="text-sm text-ink-700/60">Record a petty cash voucher</p>
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
            <label className="text-xs font-medium text-ink-700/70">Manual no.</label>
            <input
              value={header.manualNo}
              onChange={(e) => setHeader((h) => ({ ...h, manualNo: e.target.value }))}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
        </section>

        <section>
          <CashAccountSelect
            value={header.cashAccountNo}
            onChange={(cashAccountNo) => setHeader((h) => ({ ...h, cashAccountNo }))}
            accounts={pettyCashAccounts.data ?? []}
            isLoading={pettyCashAccounts.isLoading}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Expense lines</h2>
          <ExpenseLinesTable
            lines={lines}
            onAdd={() => dispatchLines({ type: "add", line: emptyLine(lines.length + 1) })}
            onUpdate={(key, patch) => dispatchLines({ type: "update", key, patch })}
            onRemove={(key) => dispatchLines({ type: "remove", key })}
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

        <div className="flex items-center justify-between rounded-md border border-ink-900/10 p-4">
          <span className="font-display text-lg text-ink-900">Total</span>
          <span className="tabular font-display text-lg text-ink-900">{total.toFixed(3)}</span>
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
          <Button onClick={handleSave} loading={save.isPending} disabled={lines.length === 0}>
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
