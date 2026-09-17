import { MasterMaintenanceView } from "@/modules/masters/MasterMaintenanceView";
import {
  paymentTypeHooks,
  emptyPaymentType,
  paymentTypeFields,
  paymentTypeToSaveRequest,
} from "@/modules/masters/paymentTypes";

export function PaymentTypesPage() {
  return (
    <MasterMaintenanceView
      title="Payment types"
      subtitle="Payment methods available at checkout"
      idLabel="Code"
      fields={paymentTypeFields}
      emptyRecord={emptyPaymentType}
      idOf={(r) => r.payId}
      nameOf={(r) => r.payName}
      statusOf={(r) => r.status}
      toSaveRequest={paymentTypeToSaveRequest}
      useList={paymentTypeHooks.useList}
      useCreate={paymentTypeHooks.useCreate}
      useUpdate={paymentTypeHooks.useUpdate}
    />
  );
}
