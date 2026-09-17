import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { NumberField } from "@/shared/components/NumberField";
import { SelectField } from "@/shared/components/SelectField";
import type { SimpleMasterOutcome } from "./api";

export interface MasterFieldDescriptor<TSave> {
  key: keyof TSave;
  label: string;
  type: "text" | "number" | "select" | "checkbox";
  maxLength?: number;
  step?: number;
  options?: { value: string; label: string }[];
  /** Coerce the select's string value back to a number on change — needed
   * for fields like `status` that are numeric bytes on the wire. */
  parseNumber?: boolean;
  /** The primary-key field is typed by hand on create but locked once a record exists. */
  disabledOnEdit?: boolean;
}

interface ListResult<TResponse> {
  data?: TResponse[];
  isLoading: boolean;
}
interface SaveMutation<TSave> {
  mutateAsync: (request: TSave) => Promise<SimpleMasterOutcome>;
  isPending: boolean;
}

interface MasterMaintenanceViewProps<TResponse, TSave> {
  title: string;
  subtitle: string;
  idLabel: string;
  fields: MasterFieldDescriptor<TSave>[];
  emptyRecord: TSave;
  idOf: (row: TResponse) => string;
  nameOf: (row: TResponse) => string;
  statusOf?: (row: TResponse) => number | undefined;
  toSaveRequest: (row: TResponse) => TSave;
  useList: () => ListResult<TResponse>;
  useCreate: () => SaveMutation<TSave>;
  useUpdate: (id: string) => SaveMutation<TSave>;
}

export function MasterMaintenanceView<TResponse, TSave>({
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
}: MasterMaintenanceViewProps<TResponse, TSave>) {
  const list = useList();
  const [form, setForm] = useState<TSave>(emptyRecord);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const create = useCreate();
  const update = useUpdate(editingId ?? "");
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
            <MasterField
              key={String(field.key)}
              field={field}
              value={form[field.key]}
              disabled={isEdit && field.disabledOnEdit}
              onChange={(value) => patch(field.key, value)}
            />
          ))}
        </div>

        {messages.length > 0 && (
          <div className="mt-4 rounded-md border border-[#b3432f]/30 bg-[#b3432f]/5 p-3">
            <ul className="list-inside list-disc text-sm text-[#b3432f]">
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

      <div className="overflow-x-auto rounded-md border border-ink-900/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 bg-parchment-100/50 text-left text-xs text-ink-700/60">
              <th className="px-3 py-2 font-medium">{idLabel}</th>
              <th className="px-3 py-2 font-medium">Name</th>
              {statusOf && <th className="px-3 py-2 font-medium">Status</th>}
              <th className="w-16 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {list.isLoading && (
              <tr>
                <td colSpan={statusOf ? 4 : 3} className="px-3 py-6 text-center text-ink-700/50">
                  Loading…
                </td>
              </tr>
            )}
            {!list.isLoading && list.data?.length === 0 && (
              <tr>
                <td colSpan={statusOf ? 4 : 3} className="px-3 py-6 text-center text-ink-700/50">
                  Nothing set up yet.
                </td>
              </tr>
            )}
            {list.data?.map((row) => {
              const status = statusOf?.(row);
              return (
                <tr key={idOf(row)} className="border-b border-ink-900/5 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs text-ink-700/70">{idOf(row)}</td>
                  <td className="px-3 py-2 text-ink-900">{nameOf(row)}</td>
                  {statusOf && (
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          status === 0
                            ? "bg-[#4c7a4a]/10 text-[#3c6339]"
                            : "bg-ink-900/5 text-ink-700/60"
                        }`}
                      >
                        {status === 0 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="text-xs font-medium text-ink-700/60 underline-offset-2 hover:text-ink-900 hover:underline"
                    >
                      Edit
                    </button>
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

function MasterField<TSave>({
  field,
  value,
  disabled,
  onChange,
}: {
  field: MasterFieldDescriptor<TSave>;
  value: unknown;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 pt-5 text-sm text-ink-900">
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
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
