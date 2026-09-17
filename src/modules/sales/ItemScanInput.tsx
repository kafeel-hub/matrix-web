import { useRef, useState, type KeyboardEvent } from "react";
import * as salesApi from "./api";
import { useItemSearch } from "./hooks";

interface ItemScanInputProps {
  nextLineNo: number;
  onItemFound: (item: Awaited<ReturnType<typeof salesApi.scanItem>>, lineNo: number) => void;
}

export function ItemScanInput({ nextLineNo, onItemFound }: ItemScanInputProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "not-found">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useItemSearch(code);

  async function commitScan(itemCode: string) {
    const trimmed = itemCode.trim();
    if (!trimmed) return;
    setStatus("loading");
    const item = await salesApi.scanItem(trimmed);
    if (!item) {
      setStatus("not-found");
      return;
    }
    setStatus("idle");
    setCode("");
    onItemFound(item, nextLineNo);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // A barcode scanner types the code then sends Enter — this is the fast
    // path. Manual typers can also hit Enter once they've typed a full code.
    if (e.key === "Enter") {
      e.preventDefault();
      commitScan(code);
    }
  }

  return (
    <div className="relative">
      <label htmlFor="item-scan" className="mb-1 block text-xs font-medium text-ink-700/70">
        Scan barcode or enter item code
      </label>
      <input
        ref={inputRef}
        id="item-scan"
        autoFocus
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          if (status === "not-found") setStatus("idle");
        }}
        onKeyDown={handleKeyDown}
        placeholder="Scan or type, then press Enter…"
        className="w-full rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2.5 text-sm focus-visible:border-brass-500"
      />

      {status === "not-found" && (
        <p className="mt-1 text-xs text-[#b3432f]">No active item found for that code.</p>
      )}

      {code.trim().length >= 2 && status !== "loading" && (search.data?.length ?? 0) > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-ink-900/10 bg-white shadow-lg">
          {search.data!.map((suggestion) => (
            <button
              key={suggestion.itemId}
              type="button"
              // The search endpoint only returns id/name, not full detail —
              // reuse itemId as the scan code to fetch full detail. This
              // assumes itemId doubles as a valid scan code server-side;
              // confirm with the API owner if items ever have a separate
              // barcode that differs from itemId.
              onClick={() => commitScan(suggestion.itemId)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-parchment-100"
            >
              <span className="font-medium text-ink-900">{suggestion.itemName}</span>
              <span className="ml-2 text-xs text-ink-700/50">{suggestion.itemId}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
