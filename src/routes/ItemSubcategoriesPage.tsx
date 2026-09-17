import { useMemo, useState } from "react";
import { ItemMasterMaintenanceView } from "@/modules/itemMasters/ItemMasterMaintenanceView";
import {
  itemSubcategoryHooks,
  emptyItemSubcategory,
  buildItemSubcategoryFields,
  itemSubcategoryToSaveRequest,
} from "@/modules/itemMasters/itemSubcategories";
import { itemCategoryHooks } from "@/modules/itemMasters/itemCategories";

export function ItemSubcategoriesPage() {
  const categories = itemCategoryHooks.useList(); // no parent filter — full list for the dropdown
  const [filterCategoryId, setFilterCategoryId] = useState("");

  const categoryOptions = useMemo(
    () => (categories.data ?? []).map((c) => ({ value: c.categoryId, label: c.name })),
    [categories.data],
  );
  const fields = useMemo(() => buildItemSubcategoryFields(categoryOptions), [categoryOptions]);

  return (
    <ItemMasterMaintenanceView
      title="Item subcategories"
      subtitle="Subcategories within a category"
      idLabel="Code"
      fields={fields}
      emptyRecord={emptyItemSubcategory}
      idOf={(r) => r.subcategoryId}
      nameOf={(r) => r.name}
      statusOf={(r) => r.status}
      toSaveRequest={itemSubcategoryToSaveRequest}
      useList={itemSubcategoryHooks.useList}
      useCreate={itemSubcategoryHooks.useCreate}
      useUpdate={itemSubcategoryHooks.useUpdate}
      useDeactivate={itemSubcategoryHooks.useDeactivate}
      parentFilter={{
        label: "Filter by category",
        value: filterCategoryId,
        onChange: setFilterCategoryId,
        options: categoryOptions,
        placeholder: "All categories",
      }}
    />
  );
}
