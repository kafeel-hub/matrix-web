import { SelectField } from "@/shared/components/SelectField";
import type { AccountLookupResponse } from "@/types/accounts";

interface CashAccountSelectProps {
  label?: string;
  value: string;
  onChange: (accountNo: string, account?: AccountLookupResponse) => void;
  accounts: AccountLookupResponse[];
  isLoading?: boolean;
}

/**
 * Deliberately restricted to GET /accounts/petty-cash's pre-vetted list,
 * unlike AccountPicker (which searches the whole chart of accounts).
 * AccountRepository.SearchAsync always filters to postable, active accounts
 * — but "postable" isn't "cash"; plenty of postable accounts (expense,
 * supplier control, etc) aren't valid cash sources. GetPettyCashAccountsAsync
 * is the one query that actually resolves the company's configured Cash GL
 * group (gl_GroupCash) and matches accounts against it, so it's the only
 * server-side guarantee of "this is a real cash account" — hence a
 * restricted select sourced only from it, not a free-text search that could
 * reach into the broader postable-account universe. Expense lines are the
 * opposite case — any postable account is correct there — so they keep
 * using the unrestricted AccountPicker.
 */
export function CashAccountSelect({
  label = "Cash account",
  value,
  onChange,
  accounts,
  isLoading,
}: CashAccountSelectProps) {
  return (
    <SelectField
      label={label}
      value={value}
      disabled={isLoading}
      onChange={(e) => {
        const accountNo = e.target.value;
        const account = accounts.find((a) => a.accountNo === accountNo);
        onChange(accountNo, account);
      }}
    >
      <option value="">{isLoading ? "Loading…" : "Select cash account…"}</option>
      {accounts.map((a) => (
        <option key={a.accountNo} value={a.accountNo}>
          {a.accountName}
          {a.isDefault ? " ★" : ""}
        </option>
      ))}
    </SelectField>
  );
}
