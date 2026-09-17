import { GoldFixingVoucherFormView } from "@/modules/goldFixingVouchers/GoldFixingVoucherFormView";
import { createGoldFixingVoucherApi } from "@/modules/goldFixingVouchers/api";
import { useCustomerList } from "@/modules/customers/hooks";

const salesGoldFixingApi = createGoldFixingVoucherApi("/sales-gold-fixing-vouchers");

export function SalesGoldFixingVoucherPage() {
  return (
    <GoldFixingVoucherFormView
      title="Sales gold fixing voucher"
      subtitle="Lock in the price for a customer's previously unfixed gold sale"
      partyLabel="Customer"
      useSearch={useCustomerList}
      api={salesGoldFixingApi}
    />
  );
}
