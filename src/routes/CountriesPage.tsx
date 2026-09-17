import { MasterMaintenanceView } from "@/modules/masters/MasterMaintenanceView";
import {
  countryHooks,
  emptyCountry,
  countryFields,
  countryToSaveRequest,
} from "@/modules/masters/countries";

export function CountriesPage() {
  return (
    <MasterMaintenanceView
      title="Countries"
      subtitle="Country reference list"
      idLabel="Code"
      fields={countryFields}
      emptyRecord={emptyCountry}
      idOf={(r) => r.countryId}
      nameOf={(r) => r.name}
      toSaveRequest={countryToSaveRequest}
      useList={countryHooks.useList}
      useCreate={countryHooks.useCreate}
      useUpdate={countryHooks.useUpdate}
    />
  );
}
