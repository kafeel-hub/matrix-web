import { useParams } from "react-router-dom";
import { PartyFormView } from "@/modules/parties/PartyFormView";
import { useSupplier, useCreateSupplier, useUpdateSupplier } from "@/modules/suppliers/hooks";

export function SupplierFormPage() {
  const { supplierId } = useParams<{ supplierId: string }>();
  return (
    <PartyFormView
      partyId={supplierId}
      singularLabel="supplier"
      basePath="/suppliers"
      useDetail={useSupplier}
      useCreate={useCreateSupplier}
      useUpdate={useUpdateSupplier}
    />
  );
}
