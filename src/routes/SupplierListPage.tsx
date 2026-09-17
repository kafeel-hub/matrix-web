import { PartyListView } from "@/modules/parties/PartyListView";
import { useSupplierList, useDeactivateSupplier } from "@/modules/suppliers/hooks";

export function SupplierListPage() {
  return (
    <PartyListView
      title="Suppliers"
      subtitle="Supplier master"
      newLabel="+ New supplier"
      basePath="/suppliers"
      emptyLabel="suppliers"
      useList={useSupplierList}
      useDeactivate={useDeactivateSupplier}
    />
  );
}
