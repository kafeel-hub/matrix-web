import { createPartyHooks } from "@/modules/parties/hooks";

const customers = createPartyHooks("customers");

export const useCustomerList = customers.useList;
export const useCustomer = customers.useDetail;
export const useCreateCustomer = customers.useCreate;
export const useUpdateCustomer = customers.useUpdate;
export const useDeactivateCustomer = customers.useDeactivate;
