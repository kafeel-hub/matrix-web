import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { NumberField } from "@/shared/components/NumberField";
import { SelectField } from "@/shared/components/SelectField";
import { AccountPicker } from "@/modules/accounts/AccountPicker";
import { useAccount } from "@/modules/accounts/hooks";
import type { ItemMasterOutcome } from "./api";

export interface ItemMasterFieldDescriptor<TSave> {
  key: keyof TSave;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "account";
  maxLength?: number;
  step?: number;
  options?: { value: string; label: string }[];
  parseNumber?: boolean; // for numeric-backed selects, e.g. status
  /** For a checkbox backed by a 0/1 number field (e.g. isDefault: byte) rather than a real boolean. */
  numericBoolean?: boolean;
  disabledOnEdit?: boolean;
}

interface ListResult<TResponse> {
  data?: TResponse[];
  isLoading: boolean;
}
interface SaveMutation<TSave> {
  mutateAsync: (request: TSave) => Promise<ItemMasterOutcome>;
  isPending: boolean;
}
interface DeactivateMutation {
  mutateAsync: (id: string) => Promise<boolean>;
}

interface ParentFilter {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string; // e.g. "All item types"
}

interface ItemMasterMaintenanceViewProps<TResponse, TSave> {
  title: string;
  subtitle: string;
  idLabel: string;
  fields: ItemMasterFieldDescriptor<TSave>[];
  emptyRecord: TSave;
  idOf: (row: TResponse) => string;
  nameOf: (row: TResponse) => string;
  statusOf: (row: TResponse) => number;
  toSaveRequest: (row: TResponse) => TSave;
  useList: (parentId?: string) => ListResult<TResponse>;
  useCreate: () => SaveMutation<TSave>;
  useUpdate: (id: string) => SaveMutation<TSave>;
  useDeactivate: () => DeactivateMutation;
  parentFilter?: ParentFilter;
}

export function ItemMasterMaintenanceView<TResponse, TSave>({
  title,
  subtitle,
  idLabel,
  fields,
  emptyRecord,
  idOf,
  nameOf,
  statusOf,
  toSaveRequest,
  useList,
  useCreate,
  useUpdate,
  useDeactivate,
  parentFilter,
}: ItemMasterMaintenanceViewProps<TResponse, TSave>) {
  const list = useList(parentFilter?.value || undefined);
  const [form, setForm] = useState<TSave>(emptyRecord);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);

  const create = useCreate();
  const update = useUpdate(editingId ?? "");
  const deactivate = useDeactivate();
  const saving = create.isPending || update.isPending;
  const isEdit = editingId !== null;

  function patch(key: keyof TSave, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }) as TSave);
  }

  function startNew() {
    setForm(emptyRecord);
    setEditingId(null);
    setMessages([]);
  }

  function startEdit(row: TResponse) {
    setForm(toSaveRequest(row));
    setEditingId(idOf(row));
    setMessages([]);
  }

  async function handleSubmit() {
    setMessages([]);
    const outcome = isEdit ? await update.mutateAsync(form) : await create.mutateAsync(form);
    if (outcome.ok) {
      startNew();
      return;
    }
    setMessages(outcome.kind === "validation" ? outcome.messages : [`${idLabel} not found.`]);
  }

  async function handleDeactivate(id: string) {
    if (pendingDeactivateId !== id) {
      setPendingDeactivateId(id);
      return;
    }
    await deactivate.mutateAsync(id);
    setPendingDeactivateId(null);
    if (editingId === id) startNew();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink-900">{title}</h1>
        <p className="text-sm text-ink-700/60">{subtitle}</p>
      </div>

      <div className="mb-8 rounded-md border border-ink-900/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-900">
            {isEdit ? `Edit ${idLabel.toLowerCase()}` : `New ${idLabel.toLowerCase()}`}
          </h2>
          {isEdit && (
            <button
              type="button"
              onClick={startNew}
              className="text-xs font-medium text-ink-700/60 underline-offset-2 hover:text-ink-900 hover:underline"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {fields.map((field) => (
            <ItemMasterField
              key={String(field.key)}
              field={field}
              value={form[field.key]}
              disabled={isEdit && field.disabledOnEdit}
              onChange={(value) => patch(field.key, value)}
            />
          ))}
        </div>

        {messages.length > 0 && (
          <div className="mt-4 rounded-md border border-[#d92d20]/30 bg-[#d92d20]/5 p-3">
            <ul className="list-inside list-disc text-sm text-[#d92d20]">
              {messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "Save changes" : `Add ${idLabel.toLowerCase()}`}
          </Button>
        </div>
      </div>

      {parentFilter && (
        <div className="mb-3 max-w-xs">
          <SelectField
            label={parentFilter.label}
            value={parentFilter.value}
            onChange={(e) => parentFilter.onChange(e.target.value)}
          >
            <option value="">{parentFilter.placeholder}</option>
            {parentFilter.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-ink-900/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 bg-parchment-100/50 text-left text-xs text-ink-700/60">
              <th className="px-3 py-2 font-medium">{idLabel}</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="w-32 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {list.isLoading && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-ink-700/50">
                  Loading…
                </td>
              </tr>
            )}
            {!list.isLoading && list.data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-ink-700/50">
                  Nothing set up yet.
                </td>
              </tr>
            )}
            {list.data?.map((row) => {
              const id = idOf(row);
              const status = statusOf(row);
              const isActive = status === 0;
              return (
                <tr key={id} className="border-b border-ink-900/5 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs text-ink-700/70">{id}</td>
                  <td className="px-3 py-2 text-ink-900">{nameOf(row)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isActive ? "bg-[#039855]/10 text-[#027a48]" : "bg-ink-900/5 text-ink-700/60"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="text-xs font-medium text-ink-700/60 underline-offset-2 hover:text-ink-900 hover:underline"
                      >
                        Edit
                      </button>
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(id)}
                          className={`text-xs font-medium underline-offset-2 hover:underline ${
                            pendingDeactivateId === id
                              ? "text-[#d92d20]"
                              : "text-ink-700/50 hover:text-ink-900"
                          }`}
                        >
                          {pendingDeactivateId === id ? "Confirm?" : "Deactivate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemMasterField<TSave>({
  field,
  value,
  disabled,
  onChange,
}: {
  field: ItemMasterFieldDescriptor<TSave>;
  value: unknown;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 pt-5 text-sm text-ink-900">
        <input
          type="checkbox"
          checked={field.numericBoolean ? value === 1 : Boolean(value)}
          disabled={disabled}
          onChange={(e) =>
            onChange(field.numericBoolean ? (e.target.checked ? 1 : 0) : e.target.checked)
          }
          className="h-4 w-4 rounded border-ink-700/30"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <SelectField
        label={field.label}
        value={value === undefined || value === null ? "" : String(value)}
        disabled={disabled}
        onChange={(e) => onChange(field.parseNumber ? Number(e.target.value) : e.target.value)}
      >
        <option value="">Select…</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectField>
    );
  }

  if (field.type === "number") {
    return (
      <NumberField
        label={field.label}
        value={(value as number) ?? 0}
        step={field.step}
        disabled={disabled}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (field.type === "account") {
    return (
      <AccountFieldValue
        label={field.label}
        value={(value as string) ?? ""}
        onChange={(accountNo) => onChange(accountNo)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-ink-700/70">{field.label}</label>
      <input
        value={(value as string) ?? ""}
        maxLength={field.maxLength}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500 disabled:opacity-50"
      />
    </div>
  );
}

/**
 * Wraps AccountPicker so a stored account number resolves to its friendly
 * name on render (via GET /accounts/{no}) instead of showing a bare code —
 * same gap caught and fixed for the petty cash form, applied here too since
 * these are the same kind of "just a code in the form state" field.
 */
function AccountFieldValue({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (accountNo: string) => void;
}) {
  const account = useAccount(value || undefined);
  return (
    <AccountPicker label={label} value={value} valueLabel={account.data?.accountName} onChange={onChange} />
  );
}
