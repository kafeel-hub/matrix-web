import { GoldVoucherFormView } from "@/modules/goldAccountVouchers/GoldVoucherFormView";
import { createGoldVoucherApi } from "@/modules/goldAccountVouchers/api";

const goldPaymentVoucherApi = createGoldVoucherApi("/gold-payment-vouchers");

export function GoldPaymentVoucherPage() {
  return (
    <GoldVoucherFormView
      title="Gold payment voucher"
      subtitle="Record a gold-fixed payment"
      accountLabel="Paid to (account)"
      api={goldPaymentVoucherApi}
      showPayGoldFields={true}
    />
  );
}
