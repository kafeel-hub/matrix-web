import { MasterMaintenanceView } from "@/modules/masters/MasterMaintenanceView";
import {
  salesmanHooks,
  emptySalesman,
  salesmanFields,
  salesmanToSaveRequest,
} from "@/modules/masters/salesmen";

export function SalesmenPage() {
  return (
    <MasterMaintenanceView
      title="Salesmen"
      subtitle="Salesmen available for assignment on sales invoices"
      idLabel="Code"
      fields={salesmanFields}
      emptyRecord={emptySalesman}
      idOf={(r) => r.salesmanId}
      nameOf={(r) => r.name ?? ""}
      statusOf={(r) => r.status}
      toSaveRequest={salesmanToSaveRequest}
      useList={salesmanHooks.useList}
      useCreate={salesmanHooks.useCreate}
      useUpdate={salesmanHooks.useUpdate}
    />
  );
}
