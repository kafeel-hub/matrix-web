import { UnfixedGoldFormView } from "@/modules/unfixedGold/UnfixedGoldFormView";
import { createUnfixedGoldApi } from "@/modules/unfixedGold/api";
import { useSupplierList } from "@/modules/suppliers/hooks";

const unfixedPurchaseApi = createUnfixedGoldApi("/unfixed-purchases");

export function UnfixedPurchasePage() {
  return (
    <UnfixedGoldFormView
      title="Unfixed purchase"
      subtitle="Gold bought now, priced later via a gold fixing voucher"
      partyLabel="Supplier"
      useSearch={useSupplierList}
      api={unfixedPurchaseApi}
    />
  );
}
