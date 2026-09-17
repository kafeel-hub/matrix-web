import { useState } from "react";
import type { PartySummaryResponse } from "@/types/catalog";

interface PartySearchResult {
  data?: PartySummaryResponse[];
  isFetching: boolean;
}

interface PartyPickerProps {
  label: string;
  value: string; // partyId
  valueLabel?: string;
  onChange: (partyId: string, partyName?: string) => void;
  useSearch: (term: string) => PartySearchResult;
  placeholder?: string;
}

/**
 * Same shape as goldItems/SupplierPicker.tsx, but parameterized by which
 * search hook to use — Unfixed Sale needs customers, Unfixed Purchase
 * needs suppliers, and `UnfixedGoldHeaderRequest.partyId` is generic on
 * the wire either way (just "the party"), so one component covers both
 * rather than two near-identical copies.
 */
export function PartyPicker({ label, value, valueLabel, onChange, useSearch, placeholder }: PartyPickerProps) {
  const [term, setTerm] = useState("");
  const search = useSearch(term);

  if (value) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-700/70">{label}</label>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-ink-700/70">{label}</label>
      <div className="relative">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder ?? "Search…"}
          className="w-full rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
        />
        {term.trim().length >= 2 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-ink-900/10 bg-white shadow-lg">
            {search.isFetching && <p className="px-3 py-2 text-xs text-ink-700/50">Searching…</p>}
            {!search.isFetching && search.data?.length === 0 && (
              <p className="px-3 py-2 text-xs text-ink-700/50">No matches</p>
            )}
            {search.data?.map((p) => (
              <button
                key={p.partyId}
                type="button"
                onClick={() => {
                  onChange(p.partyId, p.name);
                  setTerm("");
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-parchment-100"
              >
                <span className="font-medium text-ink-900">{p.name}</span>
                <span className="ml-2 text-xs text-ink-700/50">{p.partyId}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
