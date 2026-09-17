import { useMemo, useState } from "react";
import { ItemMasterMaintenanceView } from "@/modules/itemMasters/ItemMasterMaintenanceView";
import {
  itemCategoryHooks,
  emptyItemCategory,
  buildItemCategoryFields,
  itemCategoryToSaveRequest,
} from "@/modules/itemMasters/itemCategories";
import { itemTypeHooks } from "@/modules/itemMasters/itemTypes";

export function ItemCategoriesPage() {
  const itemTypes = itemTypeHooks.useList();
  const [filterItemTypeId, setFilterItemTypeId] = useState("");

  const itemTypeOptions = useMemo(
    () => (itemTypes.data ?? []).map((t) => ({ value: t.itemTypeId, label: t.name })),
    [itemTypes.data],
  );
  const fields = useMemo(() => buildItemCategoryFields(itemTypeOptions), [itemTypeOptions]);

  return (
    <ItemMasterMaintenanceView
      title="Item categories"
      subtitle="Categories within an item type (e.g. Rings, Necklaces)"
      idLabel="Code"
      fields={fields}
      emptyRecord={emptyItemCategory}
      idOf={(r) => r.categoryId}
      nameOf={(r) => r.name}
      statusOf={(r) => r.status}
      toSaveRequest={itemCategoryToSaveRequest}
      useList={itemCategoryHooks.useList}
      useCreate={itemCategoryHooks.useCreate}
      useUpdate={itemCategoryHooks.useUpdate}
      useDeactivate={itemCategoryHooks.useDeactivate}
      parentFilter={{
        label: "Filter by item type",
        value: filterItemTypeId,
        onChange: setFilterItemTypeId,
        options: itemTypeOptions,
        placeholder: "All item types",
      }}
    />
  );
}
