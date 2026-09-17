import { GoldVoucherFormView } from "@/modules/goldAccountVouchers/GoldVoucherFormView";
import { createGoldVoucherApi } from "@/modules/goldAccountVouchers/api";

const goldReceiptVoucherApi = createGoldVoucherApi("/gold-receipt-vouchers");

export function GoldReceiptVoucherPage() {
  return (
    <GoldVoucherFormView
      title="Gold receipt voucher"
      subtitle="Record a gold-fixed receipt"
      accountLabel="Received from (account)"
      api={goldReceiptVoucherApi}
      showPayGoldFields={false}
    />
  );
}
