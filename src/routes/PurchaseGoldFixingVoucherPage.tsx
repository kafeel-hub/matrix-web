import { GoldFixingVoucherFormView } from "@/modules/goldFixingVouchers/GoldFixingVoucherFormView";
import { createGoldFixingVoucherApi } from "@/modules/goldFixingVouchers/api";
import { useSupplierList } from "@/modules/suppliers/hooks";

const purchaseGoldFixingApi = createGoldFixingVoucherApi("/purchase-gold-fixing-vouchers");

export function PurchaseGoldFixingVoucherPage() {
  return (
    <GoldFixingVoucherFormView
      title="Purchase gold fixing voucher"
      subtitle="Lock in the price for a supplier's previously unfixed gold purchase"
      partyLabel="Supplier"
      useSearch={useSupplierList}
      api={purchaseGoldFixingApi}
    />
  );
}
