import { ItemMasterMaintenanceView } from "@/modules/itemMasters/ItemMasterMaintenanceView";
import {
  goldPurityHooks,
  emptyGoldPurity,
  goldPurityFields,
  goldPurityToSaveRequest,
} from "@/modules/itemMasters/goldPurities";

export function GoldPuritiesPage() {
  return (
    <ItemMasterMaintenanceView
      title="Gold purities"
      subtitle="Purity levels used for weight/rate calculations (e.g. 875, 999)"
      idLabel="Purity no."
      fields={goldPurityFields}
      emptyRecord={emptyGoldPurity}
      idOf={(r) => String(r.purityNo)}
      nameOf={(r) => r.description}
      statusOf={(r) => r.status}
      toSaveRequest={goldPurityToSaveRequest}
      useList={goldPurityHooks.useList}
      useCreate={goldPurityHooks.useCreate}
      useUpdate={goldPurityHooks.useUpdate}
      useDeactivate={goldPurityHooks.useDeactivate}
    />
  );
}
