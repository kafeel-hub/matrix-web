import { VoucherFormView } from "@/modules/accountVouchers/VoucherFormView";
import { createVoucherApi } from "@/modules/accountVouchers/api";

const paymentVoucherApi = createVoucherApi("/payment-vouchers");

export function PaymentVoucherPage() {
  return (
    <VoucherFormView
      title="Payment voucher"
      subtitle="Record money paid out"
      accountLabel="Paid to (account)"
      api={paymentVoucherApi}
    />
  );
}
