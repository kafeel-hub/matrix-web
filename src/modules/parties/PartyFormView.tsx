import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/auth/auth-store";
import { createEmptyParty, partyToFormValues, validateParty } from "./party-form";
import type { PartyDetailResponse, SavePartyRequest } from "@/types/catalog";
import type { ValidationError } from "@/types/common";
import type { SaveOutcome } from "./api";
import { Button } from "@/shared/components/Button";
import { NumberField } from "@/shared/components/NumberField";
import { SelectField } from "@/shared/components/SelectField";

// See PartyListView.tsx for why these are minimal structural shapes rather
// than the real UseQueryResult/UseMutationResult generics.
interface DetailResult {
  data?: PartyDetailResponse | null;
  isLoading: boolean;
}
interface SaveMutation {
  mutateAsync: (request: SavePartyRequest) => Promise<SaveOutcome>;
  isPending: boolean;
}

interface PartyFormViewProps {
  partyId: string | undefined;
  singularLabel: string; // "customer" | "supplier" — used in copy
  basePath: string; // "/customers" | "/suppliers"
  useDetail: (partyId: string | undefined) => DetailResult;
  useCreate: () => SaveMutation;
  useUpdate: (partyId: string) => SaveMutation;
}

export function PartyFormView({
  partyId,
  singularLabel,
  basePath,
  useDetail,
  useCreate,
  useUpdate,
}: PartyFormViewProps) {
  const isEdit = Boolean(partyId);
  const navigate = useNavigate();
  const auth = useAuthStore((s) => s.auth);
  const lookups = auth.status === "ready" ? auth.lookups : null;
  const baseCurrency = auth.status === "ready" ? auth.context.companySettings.baseCurrencyId ?? "" : "";

  const existing = useDetail(partyId);
  const create = useCreate();
  const update = useUpdate(partyId ?? "");

  const [form, setForm] = useState<SavePartyRequest>(() => createEmptyParty({ currencyId: baseCurrency }));
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  // Prefill once the existing record loads (edit mode only).
  useEffect(() => {
    if (existing.data) setForm(partyToFormValues(existing.data));
  }, [existing.data]);

  function patch(fields: Partial<SavePartyRequest>) {
    setForm((f) => ({ ...f, ...fields }));
  }

  async function handleSubmit() {
    const clientErrors = validateParty(form);
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors([]);
    setConflictMessage(null);

    const outcome = isEdit ? await update.mutateAsync(form) : await create.mutateAsync(form);
    if (outcome.ok) {
      navigate(isEdit ? `${basePath}/${partyId}` : `${basePath}/${outcome.result.partyId}`, {
        replace: true,
      });
      return;
    }
    if (outcome.kind === "validation") setErrors(outcome.errors);
    if (outcome.kind === "conflict") setConflictMessage(outcome.message);
    if (outcome.kind === "not-found") setConflictMessage(`This ${singularLabel} no longer exists.`);
  }

  const saving = create.isPending || update.isPending;

  if (isEdit && existing.isLoading) {
    return <p className="text-sm text-ink-700/50">Loading {singularLabel}…</p>;
  }
  if (isEdit && !existing.isLoading && !existing.data) {
    return <p className="text-sm text-[#d92d20]">{capitalize(singularLabel)} not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">
          {isEdit ? `Edit ${existing.data?.name ?? singularLabel}` : `New ${singularLabel}`}
        </h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <FormSection title="Basic details">
          <TextInput label="Name" value={form.name} onChange={(name) => patch({ name })} required />
          <TextInput
            label="Name (Arabic)"
            value={form.nameArabic ?? ""}
            onChange={(nameArabic) => patch({ nameArabic })}
          />
          <TextInput label="Short name" value={form.shortName ?? ""} onChange={(shortName) => patch({ shortName })} />
          <TextInput label="Phone" value={form.phone ?? ""} onChange={(phone) => patch({ phone })} />
          <TextInput label="Civil ID" value={form.civilId ?? ""} onChange={(civilId) => patch({ civilId })} />
          <TextInput label="CR no." value={form.crNo ?? ""} onChange={(crNo) => patch({ crNo })} />
          <TextInput label="Country" value={form.country ?? ""} onChange={(country) => patch({ country })} />
          <SelectField
            label="Area"
            value={form.areaId ?? ""}
            onChange={(e) => patch({ areaId: e.target.value })}
          >
            <option value="">Select…</option>
            {lookups?.areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </SelectField>
        </FormSection>

        <FormSection title="Address">
          <TextInput label="Address line 1" value={form.address1 ?? ""} onChange={(address1) => patch({ address1 })} />
          <TextInput label="Address line 2" value={form.address2 ?? ""} onChange={(address2) => patch({ address2 })} />
          <TextInput label="Address line 3" value={form.address3 ?? ""} onChange={(address3) => patch({ address3 })} />
          <TextInput label="Contact person" value={form.contactPerson ?? ""} onChange={(contactPerson) => patch({ contactPerson })} />
        </FormSection>

        <FormSection title="Credit & finance">
          <SelectField
            label="Currency"
            value={form.currencyId ?? ""}
            onChange={(e) => patch({ currencyId: e.target.value })}
          >
            <option value="">Select…</option>
            {lookups?.currencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.name}
              </option>
            ))}
          </SelectField>
          <NumberField label="Credit days" value={form.creditDays} onChange={(creditDays) => patch({ creditDays })} />
          <NumberField
            label="Credit limit"
            value={form.creditLimit}
            step={0.001}
            onChange={(creditLimit) => patch({ creditLimit })}
          />
          <TextInput label="GL account no." value={form.glAccountNo ?? ""} onChange={(glAccountNo) => patch({ glAccountNo })} />
          <NumberField
            label="Pure purity"
            value={form.purePurity}
            step={0.01}
            onChange={(purePurity) => patch({ purePurity })}
          />
          <NumberField
            label="Transfer charges"
            value={form.transferCharges}
            step={0.001}
            onChange={(transferCharges) => patch({ transferCharges })}
          />
          <label className="flex items-center gap-2 pt-5 text-sm text-ink-900">
            <input
              type="checkbox"
              checked={form.blackListed}
              onChange={(e) => patch({ blackListed: e.target.checked })}
              className="h-4 w-4 rounded border-ink-700/30"
            />
            Blacklisted
          </label>
          <SelectField
            label="Status"
            value={String(form.status)}
            onChange={(e) => patch({ status: Number(e.target.value) })}
          >
            <option value="0">Active</option>
            <option value="1">Inactive</option>
          </SelectField>
        </FormSection>

        <FormSection
          title="KYC / additional details"
          note={
            isEdit
              ? `The API doesn't return these fields for an existing ${singularLabel}, so they start blank here — saving will overwrite them with whatever's shown. Leave blank unless you mean to set new values.`
              : undefined
          }
        >
          <TextInput label="Gender" value={form.gender ?? ""} onChange={(gender) => patch({ gender })} />
          <TextInput label="Block" value={form.block ?? ""} onChange={(block) => patch({ block })} />
          <TextInput label="Jedah" value={form.jedah ?? ""} onChange={(jedah) => patch({ jedah })} />
          <TextInput label="Street" value={form.street ?? ""} onChange={(street) => patch({ street })} />
          <TextInput label="Building" value={form.building ?? ""} onChange={(building) => patch({ building })} />
          <TextInput label="Floor" value={form.floor ?? ""} onChange={(floor) => patch({ floor })} />
          <TextInput label="Flat" value={form.flat ?? ""} onChange={(flat) => patch({ flat })} />
          <TextInput label="PACI no." value={form.paciNo ?? ""} onChange={(paciNo) => patch({ paciNo })} />
        </FormSection>

        <FormSection title="Notes">
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => patch({ notes: e.target.value })}
            rows={3}
            className="col-span-2 rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
          />
        </FormSection>

        {errors.length > 0 && (
          <div className="rounded-md border border-[#d92d20]/30 bg-[#d92d20]/5 p-4">
            <ul className="list-inside list-disc text-sm text-[#d92d20]">
              {errors.map((e) => (
                <li key={e.code}>{e.message}</li>
              ))}
            </ul>
          </div>
        )}
        {conflictMessage && (
          <div className="rounded-md border border-[#d92d20]/30 bg-[#d92d20]/5 p-4 text-sm text-[#d92d20]">
            {conflictMessage}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "Save changes" : `Create ${singularLabel}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FormSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-ink-900/10 p-4">
      <h2 className="mb-3 text-sm font-semibold text-ink-900">{title}</h2>
      {note && (
        <p className="mb-3 rounded-md bg-brass-500/10 px-3 py-2 text-xs text-ink-700/80">{note}</p>
      )}
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-ink-700/70">
        {label}
        {required && <span className="text-[#d92d20]"> *</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
      />
    </div>
  );
}
