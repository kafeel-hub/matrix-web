import { createPartyHooks } from "@/modules/parties/hooks";

const suppliers = createPartyHooks("suppliers");

export const useSupplierList = suppliers.useList;
export const useSupplier = suppliers.useDetail;
export const useCreateSupplier = suppliers.useCreate;
export const useUpdateSupplier = suppliers.useUpdate;
export const useDeactivateSupplier = suppliers.useDeactivate;
