import { PartyListView } from "@/modules/parties/PartyListView";
import { useCustomerList, useDeactivateCustomer } from "@/modules/customers/hooks";

export function CustomerListPage() {
  return (
    <PartyListView
      title="Customers"
      subtitle="Credit customer master"
      newLabel="+ New customer"
      basePath="/customers"
      emptyLabel="customers"
      useList={useCustomerList}
      useDeactivate={useDeactivateCustomer}
    />
  );
}
