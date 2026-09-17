import { useParams } from "react-router-dom";
import { PartyFormView } from "@/modules/parties/PartyFormView";
import { useCustomer, useCreateCustomer, useUpdateCustomer } from "@/modules/customers/hooks";

export function CustomerFormPage() {
  const { customerId } = useParams<{ customerId: string }>();
  return (
    <PartyFormView
      partyId={customerId}
      singularLabel="customer"
      basePath="/customers"
      useDetail={useCustomer}
      useCreate={useCreateCustomer}
      useUpdate={useUpdateCustomer}
    />
  );
}
