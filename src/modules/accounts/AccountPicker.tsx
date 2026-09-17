import { useState } from "react";
import { useAccountSearch } from "./hooks";
import type { AccountLookupResponse } from "@/types/accounts";

interface AccountPickerProps {
  label?: string;
  value: string;
  valueLabel?: string; // display name for `value` when known, without re-searching
  onChange: (accountNo: string, account?: AccountLookupResponse) => void;
  quickOptions?: AccountLookupResponse[]; // one-click chips for common choices, if any
  placeholder?: string;
}

/**
 * A small search-as-you-type combobox over GET /accounts/search. Every
 * result is guaranteed postable and active — AccountRepository.SearchAsync
 * filters `Account_Postable = 'YES'` and `Account_Status = 0` unconditionally
 * in SQL, not as an optional query param — so this is the right picker for
 * any "pick a GL account to post to" field (expense lines, item-type/category
 * account mappings, etc). For a field that must be a *cash* account
 * specifically, use CashAccountSelect instead — postable alone doesn't mean
 * cash; see that component for why.
 * Shows `quickOptions` (when given) as one-click chips above the search box.
 */
export function AccountPicker({
  label,
  value,
  valueLabel,
  onChange,
  quickOptions,
  placeholder = "Search accounts…",
}: AccountPickerProps) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const search = useAccountSearch(term);

  function select(account: AccountLookupResponse) {
    onChange(account.accountNo, account);
    setTerm("");
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-ink-700/70">{label}</label>}

      {value ? (
        <div className="flex items-center justify-between rounded-md border border-ink-900/10 bg-parchment-100/50 px-2.5 py-1.5">
          <div>
            <span className="text-sm font-medium text-ink-900">{value}</span>
            {valueLabel && <span className="ml-2 text-xs text-ink-700/50">{valueLabel}</span>}
          </div>
          <button
            type="button"
            onClick={() => onChange("", undefined)}
            className="text-xs font-medium text-ink-700/50 hover:text-ink-900"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          {quickOptions && quickOptions.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {quickOptions.map((account) => (
                <button
                  key={account.accountNo}
                  type="button"
                  onClick={() => select(account)}
                  className="rounded-full border border-brass-500/40 bg-brass-500/10 px-2.5 py-1 text-xs font-medium text-ink-900 hover:bg-brass-500/20"
                >
                  {account.accountName}
                  {account.isDefault && " ★"}
                </button>
              ))}
            </div>
          )}
          <input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
          />
          {open && term.trim().length >= 2 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-ink-900/10 bg-white shadow-lg">
              {search.isFetching && <p className="px-3 py-2 text-xs text-ink-700/50">Searching…</p>}
              {!search.isFetching && search.data?.items.length === 0 && (
                <p className="px-3 py-2 text-xs text-ink-700/50">No matching accounts</p>
              )}
              {search.data?.items.map((account) => (
                <button
                  key={account.accountNo}
                  type="button"
                  onClick={() => select(account)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-parchment-100"
                >
                  <span className="font-medium text-ink-900">{account.accountName}</span>
                  <span className="ml-2 text-xs text-ink-700/50">{account.accountNo}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
