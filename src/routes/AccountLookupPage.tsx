import { useState } from "react";
import { useAccountSearch, useAccount } from "@/modules/accounts/hooks";

export function AccountLookupPage() {
  const [term, setTerm] = useState("");
  const [selectedAccountNo, setSelectedAccountNo] = useState<string | null>(null);
  const search = useAccountSearch(term);
  const account = useAccount(selectedAccountNo ?? undefined);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink-900">Accounts</h1>
        <p className="text-sm text-ink-700/60">Chart of accounts lookup and balance check</p>
      </div>

      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search by account name or number…"
        className="mb-4 w-full max-w-sm rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="overflow-hidden rounded-md border border-ink-900/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 bg-parchment-100/50 text-left text-xs text-ink-700/60">
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="px-3 py-2 font-medium">Currency</th>
              </tr>
            </thead>
            <tbody>
              {term.trim().length < 2 && (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-ink-700/50">
                    Type at least 2 characters to search.
                  </td>
                </tr>
              )}
              {term.trim().length >= 2 && search.isFetching && (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-ink-700/50">
                    Searching…
                  </td>
                </tr>
              )}
              {term.trim().length >= 2 && !search.isFetching && search.data?.items.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-ink-700/50">
                    No matching accounts.
                  </td>
                </tr>
              )}
              {search.data?.items.map((a) => (
                <tr
                  key={a.accountNo}
                  onClick={() => setSelectedAccountNo(a.accountNo)}
                  className={`cursor-pointer border-b border-ink-900/5 last:border-0 hover:bg-parchment-100 ${
                    selectedAccountNo === a.accountNo ? "bg-brass-500/10" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <p className="font-medium text-ink-900">{a.accountName}</p>
                    <p className="text-xs text-ink-700/50">{a.accountNo}</p>
                  </td>
                  <td className="px-3 py-2 text-ink-700/70">{a.currencyId}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {search.data?.hasMore && (
            <p className="border-t border-ink-900/10 px-3 py-2 text-xs text-ink-700/50">
              More results exist — narrow your search to see them.
            </p>
          )}
        </div>

        <div className="rounded-md border border-ink-900/10 p-4">
          {!selectedAccountNo && (
            <p className="text-sm text-ink-700/50">Select an account to see its balance and details.</p>
          )}
          {selectedAccountNo && account.isLoading && (
            <p className="text-sm text-ink-700/50">Loading…</p>
          )}
          {selectedAccountNo && !account.isLoading && !account.data && (
            <p className="text-sm text-[#b3432f]">Account not found.</p>
          )}
          {account.data && (
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-display text-lg text-ink-900">{account.data.accountName}</p>
                <p className="text-xs text-ink-700/50">{account.data.accountNo}</p>
              </div>
              <div className="flex items-baseline justify-between border-t border-ink-900/10 pt-3">
                <span className="text-sm text-ink-700/60">Balance</span>
                <span className="tabular font-display text-xl text-ink-900">
                  {account.data.balance.toFixed(3)}{" "}
                  <span className="text-sm text-ink-700/50">{account.data.balanceType}</span>
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-ink-700/60">Currency</dt>
                <dd className="text-right text-ink-900">{account.data.currencyId}</dd>
                <dt className="text-ink-700/60">Group</dt>
                <dd className="text-right text-ink-900">{account.data.accountGroupCode}</dd>
                <dt className="text-ink-700/60">Level</dt>
                <dd className="text-right text-ink-900">{account.data.accountLevel}</dd>
                <dt className="text-ink-700/60">Postable</dt>
                <dd className="text-right text-ink-900">{account.data.isPostable ? "Yes" : "No"}</dd>
                <dt className="text-ink-700/60">Active</dt>
                <dd className="text-right text-ink-900">{account.data.isActive ? "Yes" : "No"}</dd>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
