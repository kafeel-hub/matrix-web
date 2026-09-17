import { VoucherFormView } from "@/modules/accountVouchers/VoucherFormView";
import { createVoucherApi } from "@/modules/accountVouchers/api";

const receiptVoucherApi = createVoucherApi("/receipt-vouchers");

export function ReceiptVoucherPage() {
  return (
    <VoucherFormView
      title="Receipt voucher"
      subtitle="Record money received"
      accountLabel="Received from (account)"
      api={receiptVoucherApi}
    />
  );
}
