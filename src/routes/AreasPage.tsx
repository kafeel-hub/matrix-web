import { MasterMaintenanceView } from "@/modules/masters/MasterMaintenanceView";
import { areaHooks, emptyArea, areaFields, areaToSaveRequest } from "@/modules/masters/areas";

export function AreasPage() {
  return (
    <MasterMaintenanceView
      title="Areas"
      subtitle="Delivery/billing areas used on customer and supplier records"
      idLabel="Code"
      fields={areaFields}
      emptyRecord={emptyArea}
      idOf={(r) => r.areaId}
      nameOf={(r) => r.name ?? ""}
      toSaveRequest={areaToSaveRequest}
      useList={areaHooks.useList}
      useCreate={areaHooks.useCreate}
      useUpdate={areaHooks.useUpdate}
    />
  );
}
