import { useState } from "react";
import { useSupplierList } from "@/modules/suppliers/hooks";

interface SupplierPickerProps {
  value: string; // supplierId
  valueLabel?: string;
  onChange: (supplierId: string, supplierName?: string) => void;
}

export function SupplierPicker({ value, valueLabel, onChange }: SupplierPickerProps) {
  const [term, setTerm] = useState("");
  const search = useSupplierList(term);

  if (value) {
    return (
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
    );
  }

  return (
    <div className="relative">
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search supplier…"
        className="w-full rounded-md border border-ink-700/20 bg-parchment-50 px-2.5 py-1.5 text-sm focus-visible:border-brass-500"
      />
      {term.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-ink-900/10 bg-white shadow-lg">
          {search.isFetching && <p className="px-3 py-2 text-xs text-ink-700/50">Searching…</p>}
          {!search.isFetching && search.data?.length === 0 && (
            <p className="px-3 py-2 text-xs text-ink-700/50">No matching suppliers</p>
          )}
          {search.data?.map((s) => (
            <button
              key={s.partyId}
              type="button"
              onClick={() => {
                onChange(s.partyId, s.name);
                setTerm("");
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-parchment-100"
            >
              <span className="font-medium text-ink-900">{s.name}</span>
              <span className="ml-2 text-xs text-ink-700/50">{s.partyId}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
