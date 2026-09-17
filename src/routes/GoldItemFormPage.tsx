import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGoldItem,
  useCreateGoldItem,
  useUpdateGoldItem,
} from "@/modules/goldItems/hooks";
import * as goldItemsApi from "@/modules/goldItems/api";
import { createEmptyGoldItem, goldItemToSaveRequest } from "@/modules/goldItems/item-form";
import { SupplierPicker } from "@/modules/goldItems/SupplierPicker";
import { itemTypeHooks } from "@/modules/itemMasters/itemTypes";
import { itemCategoryHooks } from "@/modules/itemMasters/itemCategories";
import { itemSubcategoryHooks } from "@/modules/itemMasters/itemSubcategories";
import { itemDesignHooks } from "@/modules/itemMasters/itemDesigns";
import { goldPurityHooks } from "@/modules/itemMasters/goldPurities";
import { countryHooks } from "@/modules/masters/countries";
import type { SaveGoldItemRequest } from "@/types/goldItems";
import { Button } from "@/shared/components/Button";
import { NumberField } from "@/shared/components/NumberField";
import { SelectField } from "@/shared/components/SelectField";

export function GoldItemFormPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const isEdit = Boolean(itemId);
  const navigate = useNavigate();

  const existing = useGoldItem(itemId);
  const create = useCreateGoldItem();
  const update = useUpdateGoldItem(itemId ?? "");

  const itemTypes = itemTypeHooks.useList();
  const [form, setForm] = useState<SaveGoldItemRequest>(createEmptyGoldItem);
  const categories = itemCategoryHooks.useList(form.itemTypeId || undefined);
  const subcategories = itemSubcategoryHooks.useList(form.categoryId || undefined);
  const designs = itemDesignHooks.useList();
  const purities = goldPurityHooks.useList();
  const countries = countryHooks.useList();

  const [supplierName, setSupplierName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Prefill once the existing record loads (edit mode only) — same pattern as PartyFormView.
  useEffect(() => {
    if (existing.data) setForm(goldItemToSaveRequest(existing.data));
  }, [existing.data]);

  function patch(fields: Partial<SaveGoldItemRequest>) {
    setForm((f) => ({ ...f, ...fields }));
  }

  async function generateCode() {
    if (!form.itemTypeId || !form.categoryId) return;
    setGeneratingCode(true);
    const next = await goldItemsApi.getNextGoldItemCode({
      itemTypeId: form.itemTypeId,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || undefined,
    });
    setGeneratingCode(false);
    if (next) patch({ itemId: next.itemId });
  }

  async function handleSubmit() {
    setErrorMessage(null);
    // Omit a blank itemId on create so the API auto-generates one.
    const request: SaveGoldItemRequest = { ...form, itemId: form.itemId || null };
    const outcome = isEdit ? await update.mutateAsync(request) : await create.mutateAsync(request);
    if (outcome.ok) {
      navigate(`/items/${encodeURIComponent(outcome.result.itemId)}`, { replace: true });
      return;
    }
    if (outcome.kind === "validation") setErrorMessage(outcome.message);
    if (outcome.kind === "not-found") setErrorMessage("This item no longer exists.");
  }

  const saving = create.isPending || update.isPending;

  if (isEdit && existing.isLoading) {
    return <p className="text-sm text-ink-700/50">Loading item…</p>;
  }
  if (isEdit && !existing.isLoading && !existing.data) {
    return <p className="text-sm text-[#b3432f]">Item not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">
          {isEdit ? `Edit ${existing.data?.name ?? "item"}` : "New item"}
        </h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <FormSection title="Identification">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TextInput
                label="Item code"
                value={form.itemId ?? ""}
                onChange={(itemId) => patch({ itemId })}
                disabled={isEdit}
                placeholder="Leave blank to auto-generate"
              />
            </div>
            {!isEdit && (
              <Button
                type="button"
                variant="secondary"
                onClick={generateCode}
                loading={generatingCode}
                disabled={!form.itemTypeId || !form.categoryId}
              >
                Generate
              </Button>
            )}
          </div>
          <TextInput label="Barcode" value={form.barcode ?? ""} onChange={(barcode) => patch({ barcode })} placeholder="Leave blank to auto-generate" />
          <TextInput label="Name" value={form.name} onChange={(name) => patch({ name })} required />
          <TextInput label="Name (Arabic)" value={form.nameArabic ?? ""} onChange={(nameArabic) => patch({ nameArabic })} />
          <TextInput label="Supplier item code" value={form.supplierItemId ?? ""} onChange={(supplierItemId) => patch({ supplierItemId })} />
          <TextInput label="Size" value={form.size ?? ""} onChange={(size) => patch({ size })} />
        </FormSection>

        <FormSection title="Classification">
          <SelectField
            label="Item type"
            value={form.itemTypeId}
            onChange={(e) => patch({ itemTypeId: e.target.value, categoryId: "", subcategoryId: "" })}
          >
            <option value="">Select…</option>
            {itemTypes.data?.map((t) => (
              <option key={t.itemTypeId} value={t.itemTypeId}>
                {t.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Category"
            value={form.categoryId}
            onChange={(e) => patch({ categoryId: e.target.value, subcategoryId: "" })}
            disabled={!form.itemTypeId}
          >
            <option value="">Select…</option>
            {categories.data?.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Subcategory"
            value={form.subcategoryId ?? ""}
            onChange={(e) => patch({ subcategoryId: e.target.value })}
            disabled={!form.categoryId}
          >
            <option value="">None</option>
            {subcategories.data?.map((s) => (
              <option key={s.subcategoryId} value={s.subcategoryId}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Design"
            value={form.designId ?? ""}
            onChange={(e) => patch({ designId: e.target.value })}
          >
            <option value="">None</option>
            {designs.data?.map((d) => (
              <option key={d.designId} value={d.designId}>
                {d.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Country"
            value={form.countryId ?? ""}
            onChange={(e) => patch({ countryId: e.target.value })}
          >
            <option value="">None</option>
            {countries.data?.map((c) => (
              <option key={c.countryId} value={c.countryId}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Gold purity"
            value={String(form.goldPurity)}
            onChange={(e) => patch({ goldPurity: Number(e.target.value) })}
          >
            <option value="0">Select…</option>
            {purities.data?.map((p) => (
              <option key={p.purityNo} value={p.purityNo}>
                {p.description} ({p.purityNo})
              </option>
            ))}
          </SelectField>
        </FormSection>

        <FormSection title="Weight">
          <NumberField label="Gold weight (g)" value={form.goldWeight} step={0.001} onChange={(goldWeight) => patch({ goldWeight })} />
          <NumberField label="Stone weight (g)" value={form.stoneWeight} step={0.001} onChange={(stoneWeight) => patch({ stoneWeight })} />
          <NumberField label="Weight per piece" value={form.weightPerPiece} step={0.001} onChange={(weightPerPiece) => patch({ weightPerPiece })} />
          <NumberField label="Stone weight per piece" value={form.stoneWeightPerPiece} step={0.001} onChange={(stoneWeightPerPiece) => patch({ stoneWeightPerPiece })} />
          <NumberField label="Pieces stock flag (code)" value={form.piecesStockFlag} onChange={(piecesStockFlag) => patch({ piecesStockFlag })} />
        </FormSection>

        <FormSection title="Cost & pricing">
          <NumberField label="Opening making cost" value={form.openingMakingCost} step={0.001} onChange={(openingMakingCost) => patch({ openingMakingCost })} />
          <NumberField label="Average making cost" value={form.averageMakingCost} step={0.001} onChange={(averageMakingCost) => patch({ averageMakingCost })} />
          <NumberField label="Current making cost" value={form.currentMakingCost} step={0.001} onChange={(currentMakingCost) => patch({ currentMakingCost })} />
          <NumberField label="Making cost type (code)" value={form.makingCostType} onChange={(makingCostType) => patch({ makingCostType })} />
          <NumberField label="Supplier cost" value={form.supplierCost} step={0.001} onChange={(supplierCost) => patch({ supplierCost })} />
          <NumberField label="Cost price type (code)" value={form.costPriceType} onChange={(costPriceType) => patch({ costPriceType })} />
          <NumberField label="Sale price" value={form.salePrice} step={0.001} onChange={(salePrice) => patch({ salePrice })} />
          <NumberField label="Sale price type (code)" value={form.salePriceType} onChange={(salePriceType) => patch({ salePriceType })} />
          <NumberField label="Gold price/weight type (code)" value={form.goldPriceWeightType} onChange={(goldPriceWeightType) => patch({ goldPriceWeightType })} />
        </FormSection>

        <FormSection title="Supplier & purchase">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink-700/70">Supplier</label>
            <SupplierPicker
              value={form.supplierId ?? ""}
              valueLabel={supplierName}
              onChange={(supplierId, name) => {
                patch({ supplierId });
                setSupplierName(name ?? "");
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-700/70">Purchase date</label>
            <input
              type="date"
              value={form.purchaseDate?.slice(0, 10) ?? ""}
              onChange={(e) => patch({ purchaseDate: e.target.value || null })}
              className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
            />
          </div>
          <NumberField label="Purchase transaction no." value={form.purchaseTransactionNo} onChange={(purchaseTransactionNo) => patch({ purchaseTransactionNo })} />
        </FormSection>

        <FormSection title="Diamond details" note="Only relevant for diamond-set items — leave blank otherwise.">
          <TextInput label="Clarity" value={form.diamondClarity ?? ""} onChange={(diamondClarity) => patch({ diamondClarity })} />
          <TextInput label="Color" value={form.diamondColor ?? ""} onChange={(diamondColor) => patch({ diamondColor })} />
          <TextInput label="Cut" value={form.diamondCut ?? ""} onChange={(diamondCut) => patch({ diamondCut })} />
        </FormSection>

        <FormSection title="Barcode & status">
          <NumberField label="Barcode flag (code)" value={form.barcodeFlag} onChange={(barcodeFlag) => patch({ barcodeFlag })} />
          <NumberField label="Barcode serial no." value={form.barcodeSerialNo} onChange={(barcodeSerialNo) => patch({ barcodeSerialNo })} />
          <SelectField
            label="Status"
            value={String(form.status)}
            onChange={(e) => patch({ status: Number(e.target.value) })}
          >
            <option value="0">Active</option>
            <option value="1">Inactive</option>
          </SelectField>
        </FormSection>

        {errorMessage && (
          <div className="rounded-md border border-[#b3432f]/30 bg-[#b3432f]/5 p-4 text-sm text-[#b3432f]">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "Save changes" : "Create item"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-ink-900/10 p-4">
      <h2 className="mb-3 text-sm font-semibold text-ink-900">{title}</h2>
      {note && <p className="mb-3 rounded-md bg-brass-500/10 px-3 py-2 text-xs text-ink-700/80">{note}</p>}
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-ink-700/70">
        {label}
        {required && <span className="text-[#b3432f]"> *</span>}
      </label>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500 disabled:opacity-50"
      />
    </div>
  );
}
