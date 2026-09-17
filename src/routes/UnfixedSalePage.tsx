import { UnfixedGoldFormView } from "@/modules/unfixedGold/UnfixedGoldFormView";
import { createUnfixedGoldApi } from "@/modules/unfixedGold/api";
import { useCustomerList } from "@/modules/customers/hooks";

const unfixedSaleApi = createUnfixedGoldApi("/unfixed-sales");

export function UnfixedSalePage() {
  return (
    <UnfixedGoldFormView
      title="Unfixed sale"
      subtitle="Gold sold now, priced later via a gold fixing voucher"
      partyLabel="Customer"
      useSearch={useCustomerList}
      api={unfixedSaleApi}
    />
  );
}
