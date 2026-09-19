import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoldItemSearch, useDeactivateGoldItem } from "@/modules/goldItems/hooks";
import { itemTypeHooks } from "@/modules/itemMasters/itemTypes";
import { itemCategoryHooks } from "@/modules/itemMasters/itemCategories";
import { itemSubcategoryHooks } from "@/modules/itemMasters/itemSubcategories";
import { SelectField } from "@/shared/components/SelectField";
import { Button } from "@/shared/components/Button";
import type { GoldItemListResponse } from "@/types/goldItems";

export function GoldItemListPage() {
  const [search, setSearch] = useState("");
  const [itemTypeId, setItemTypeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const navigate = useNavigate();

  const itemTypes = itemTypeHooks.useList();
  const categories = itemCategoryHooks.useList(itemTypeId || undefined);
  const subcategories = itemSubcategoryHooks.useList(categoryId || undefined);

  const items = useGoldItemSearch({ search, itemTypeId, categoryId, subcategoryId });
  const deactivate = useDeactivateGoldItem();
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);

  const categoryOptions = useMemo(() => categories.data ?? [], [categories.data]);
  const subcategoryOptions = useMemo(() => subcategories.data ?? [], [subcategories.data]);

  async function confirmDeactivate(item: GoldItemListResponse) {
    if (pendingDeactivateId !== item.itemId) {
      setPendingDeactivateId(item.itemId);
      return;
    }
    await deactivate.mutateAsync(item.itemId);
    setPendingDeactivateId(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Items</h1>
          <p className="text-sm text-ink-700/60">Gold item inventory master</p>
        </div>
        <Button onClick={() => navigate("/items/new")}>+ New item</Button>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or barcode…"
          className="rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
        />
        <SelectField
          value={itemTypeId}
          onChange={(e) => {
            setItemTypeId(e.target.value);
            setCategoryId("");
            setSubcategoryId("");
          }}
        >
          <option value="">All item types</option>
          {itemTypes.data?.map((t) => (
            <option key={t.itemTypeId} value={t.itemTypeId}>
              {t.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubcategoryId("");
          }}
        >
          <option value="">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
          <option value="">All subcategories</option>
          {subcategoryOptions.map((s) => (
            <option key={s.subcategoryId} value={s.subcategoryId}>
              {s.name}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="overflow-x-auto rounded-md border border-ink-900/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 bg-parchment-100/50 text-left text-xs text-ink-700/60">
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">Barcode</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Purity</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="w-28 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-ink-700/50">
                  Loading…
                </td>
              </tr>
            )}
            {!items.isLoading && items.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-ink-700/50">
                  No items match those filters.
                </td>
              </tr>
            )}
            {items.data?.map((item) => (
              <tr key={item.itemId} className="border-b border-ink-900/5 last:border-0">
                <td className="px-3 py-2">
                  <Link
                    to={`/items/${encodeURIComponent(item.itemId)}`}
                    className="font-medium text-ink-900 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-ink-700/50">{item.itemId}</p>
                </td>
                <td className="px-3 py-2 text-ink-700/70">{item.barcode || "—"}</td>
                <td className="px-3 py-2 text-ink-700/70">
                  {item.categoryId}
                  {item.subcategoryId ? ` / ${item.subcategoryId}` : ""}
                </td>
                <td className="tabular px-3 py-2 text-ink-700/70">{item.goldPurity}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === 0
                        ? "bg-[#039855]/10 text-[#027a48]"
                        : "bg-ink-900/5 text-ink-700/60"
                    }`}
                  >
                    {item.status === 0 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {item.status === 0 && (
                    <button
                      type="button"
                      onClick={() => confirmDeactivate(item)}
                      className={`text-xs font-medium underline-offset-2 hover:underline ${
                        pendingDeactivateId === item.itemId
                          ? "text-[#d92d20]"
                          : "text-ink-700/50 hover:text-ink-900"
                      }`}
                    >
                      {pendingDeactivateId === item.itemId ? "Confirm?" : "Deactivate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
