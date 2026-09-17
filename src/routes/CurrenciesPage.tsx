import { MasterMaintenanceView } from "@/modules/masters/MasterMaintenanceView";
import {
  currencyHooks,
  emptyCurrency,
  currencyFields,
  currencyToSaveRequest,
} from "@/modules/masters/currencies";

export function CurrenciesPage() {
  return (
    <MasterMaintenanceView
      title="Currencies"
      subtitle="Currencies available for pricing and payments"
      idLabel="Code"
      fields={currencyFields}
      emptyRecord={emptyCurrency}
      idOf={(r) => r.currencyId}
      nameOf={(r) => r.name}
      toSaveRequest={currencyToSaveRequest}
      useList={currencyHooks.useList}
      useCreate={currencyHooks.useCreate}
      useUpdate={currencyHooks.useUpdate}
    />
  );
}
