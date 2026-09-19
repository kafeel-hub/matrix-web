import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import type { PartySummaryResponse } from "@/types/catalog";

// Minimal structural shapes of what's actually used from the React Query
// results — deliberately not importing UseQueryResult/UseMutationResult
// directly, since the real objects returned by createPartyHooks carry many
// more fields than this; TypeScript's structural typing means the actual
// hook results satisfy these narrower interfaces without any casting.
interface ListResult {
  data?: PartySummaryResponse[];
  isLoading: boolean;
}
interface DeactivateMutation {
  mutateAsync: (partyId: string) => Promise<boolean>;
}

interface PartyListViewProps {
  title: string;
  subtitle: string;
  newLabel: string;
  basePath: string; // e.g. "/customers" or "/suppliers"
  idColumnLabel?: string;
  emptyLabel: string; // e.g. "customers" / "suppliers", used in "No {x} yet."
  useList: (term: string) => ListResult;
  useDeactivate: () => DeactivateMutation;
}

export function PartyListView({
  title,
  subtitle,
  newLabel,
  basePath,
  idColumnLabel = "Civil ID",
  emptyLabel,
  useList,
  useDeactivate,
}: PartyListViewProps) {
  const [term, setTerm] = useState("");
  const parties = useList(term);
  const deactivate = useDeactivate();
  const navigate = useNavigate();
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);

  async function confirmDeactivate(party: PartySummaryResponse) {
    if (pendingDeactivateId !== party.partyId) {
      setPendingDeactivateId(party.partyId);
      return;
    }
    await deactivate.mutateAsync(party.partyId);
    setPendingDeactivateId(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{title}</h1>
          <p className="text-sm text-ink-700/60">{subtitle}</p>
        </div>
        <Button onClick={() => navigate(`${basePath}/new`)}>{newLabel}</Button>
      </div>

      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search by name…"
        className="mb-4 w-full max-w-sm rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
      />

      <div className="overflow-x-auto rounded-md border border-ink-900/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 bg-parchment-100/50 text-left text-xs text-ink-700/60">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">{idColumnLabel}</th>
              <th className="px-3 py-2 text-right font-medium">Credit limit</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="w-28 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {parties.isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-ink-700/50">
                  Loading…
                </td>
              </tr>
            )}
            {!parties.isLoading && parties.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-ink-700/50">
                  {term ? `No ${emptyLabel} match that search.` : `No ${emptyLabel} yet.`}
                </td>
              </tr>
            )}
            {parties.data?.map((party) => (
              <tr key={party.partyId} className="border-b border-ink-900/5 last:border-0">
                <td className="px-3 py-2">
                  <Link
                    to={`${basePath}/${encodeURIComponent(party.partyId)}`}
                    className="font-medium text-ink-900 hover:underline"
                  >
                    {party.name}
                  </Link>
                  {party.blackListed && (
                    <span className="ml-2 rounded-full bg-[#d92d20]/10 px-2 py-0.5 text-xs font-medium text-[#d92d20]">
                      Blacklisted
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-ink-700/70">{party.phone || "—"}</td>
                <td className="px-3 py-2 text-ink-700/70">{party.civilId || "—"}</td>
                <td className="tabular px-3 py-2 text-right text-ink-700/70">
                  {party.creditLimit.toFixed(3)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      party.status === 0
                        ? "bg-[#039855]/10 text-[#027a48]"
                        : "bg-ink-900/5 text-ink-700/60"
                    }`}
                  >
                    {party.status === 0 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {party.status === 0 && (
                    <button
                      type="button"
                      onClick={() => confirmDeactivate(party)}
                      className={`text-xs font-medium underline-offset-2 hover:underline ${
                        pendingDeactivateId === party.partyId
                          ? "text-[#d92d20]"
                          : "text-ink-700/50 hover:text-ink-900"
                      }`}
                    >
                      {pendingDeactivateId === party.partyId ? "Confirm?" : "Deactivate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
