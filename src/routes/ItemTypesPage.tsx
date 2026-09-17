import { ItemMasterMaintenanceView } from "@/modules/itemMasters/ItemMasterMaintenanceView";
import {
  itemTypeHooks,
  emptyItemType,
  itemTypeFields,
  itemTypeToSaveRequest,
} from "@/modules/itemMasters/itemTypes";

export function ItemTypesPage() {
  return (
    <ItemMasterMaintenanceView
      title="Item types"
      subtitle="Top-level item classification (e.g. Gold, Diamond)"
      idLabel="Code"
      fields={itemTypeFields}
      emptyRecord={emptyItemType}
      idOf={(r) => r.itemTypeId}
      nameOf={(r) => r.name}
      statusOf={(r) => r.status}
      toSaveRequest={itemTypeToSaveRequest}
      useList={itemTypeHooks.useList}
      useCreate={itemTypeHooks.useCreate}
      useUpdate={itemTypeHooks.useUpdate}
      useDeactivate={itemTypeHooks.useDeactivate}
    />
  );
}
