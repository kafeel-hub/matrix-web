import { ItemMasterMaintenanceView } from "@/modules/itemMasters/ItemMasterMaintenanceView";
import {
  itemDesignHooks,
  emptyItemDesign,
  itemDesignFields,
  itemDesignToSaveRequest,
} from "@/modules/itemMasters/itemDesigns";

export function ItemDesignsPage() {
  return (
    <ItemMasterMaintenanceView
      title="Item designs"
      subtitle="Design codes used on item records"
      idLabel="Code"
      fields={itemDesignFields}
      emptyRecord={emptyItemDesign}
      idOf={(r) => r.designId}
      nameOf={(r) => r.name}
      statusOf={(r) => r.status}
      toSaveRequest={itemDesignToSaveRequest}
      useList={itemDesignHooks.useList}
      useCreate={itemDesignHooks.useCreate}
      useUpdate={itemDesignHooks.useUpdate}
      useDeactivate={itemDesignHooks.useDeactivate}
    />
  );
}
