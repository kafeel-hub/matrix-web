import { useState } from "react";
import type { SalesInvoiceHeaderRequest } from "@/types/sales";
import { useCustomerSearch } from "./hooks";
import * as salesApi from "./api";
import { Button } from "@/shared/components/Button";

type Mode = "master" | "retail" | "walk-in";

interface CustomerPickerProps {
  header: SalesInvoiceHeaderRequest;
  onChange: (patch: Partial<SalesInvoiceHeaderRequest>) => void;
}

/**
 * The API exposes two different ways to identify a customer:
 *  - a full master party record (search-by-name, GET /customers + /customers/{id})
 *  - a lighter retail/KYC lookup by civil ID or mobile (GET /customers/search)
 * Plus a sale can just be walk-in with no master record at all. This panel
 * covers all three rather than picking one and losing the others.
 */
export function CustomerPicker({ header, onChange }: CustomerPickerProps) {
  const [mode, setMode] = useState<Mode>(header.customerId ? "master" : "walk-in");
  const [term, setTerm] = useState("");
  const [retailQuery, setRetailQuery] = useState({ civilId: "", mobileNo: "" });
  const [retailStatus, setRetailStatus] = useState<"idle" | "loading" | "not-found">("idle");
  const search = useCustomerSearch(term);

  const isSelected = Boolean(header.customerId);

  async function selectMaster(customerId: string) {
    const detail = await salesApi.getCustomer(customerId);
    if (!detail) return;
    onChange({
      partyType: 1,
      customerId: detail.partyId,
      customerName: detail.name,
      customerNameArabic: detail.nameArabic ?? "",
      customerAddress1: detail.address1 ?? "",
      customerAddress2: detail.address2 ?? "",
      customerPhone: detail.phone ?? "",
      customerCivilId: detail.civilId ?? "",
      customerCrNo: detail.crNo ?? "",
      customerAreaCode: detail.areaId ?? "",
      customerCountryCode: detail.country ?? "",
    });
    setTerm("");
  }

  async function lookupRetail() {
    if (!retailQuery.civilId && !retailQuery.mobileNo) return;
    setRetailStatus("loading");
    const result = await salesApi.searchRetailCustomer(retailQuery);
    if (!result) {
      setRetailStatus("not-found");
      return;
    }
    setRetailStatus("idle");
    onChange({
      partyType: 0,
      customerId: result.customerId,
      customerName: result.customerName,
      customerNameArabic: result.customerNameArabic ?? "",
      customerMobile: result.mobileNo ?? "",
      customerPhone: result.alternatePhoneNo ?? "",
      customerCivilId: result.civilId ?? "",
      customerAreaCode: result.areaId ?? "",
    });
  }

  function clearCustomer() {
    onChange({
      partyType: 0,
      customerId: "",
      customerName: "",
      customerNameArabic: "",
      customerAddress1: "",
      customerAddress2: "",
      customerPhone: "",
      customerMobile: "",
      customerCivilId: "",
      customerCrNo: "",
      customerAreaCode: "",
      customerCountryCode: "",
    });
    setRetailStatus("idle");
  }

  if (isSelected) {
    return (
      <div className="flex items-start justify-between rounded-md border border-ink-900/10 bg-parchment-100/50 p-3">
        <div>
          <p className="text-sm font-medium text-ink-900">{header.customerName}</p>
          <p className="text-xs text-ink-700/60">
            {[header.customerId, header.customerMobile || header.customerPhone, header.customerCivilId]
              .filter(Boolean)
              .join(" · ") || "Walk-in customer"}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCustomer}
          className="text-xs font-medium text-ink-700/60 underline-offset-2 hover:text-ink-900 hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-ink-900/10 p-3">
      <div className="mb-3 flex gap-1">
        {(
          [
            ["master", "Search customer"],
            ["retail", "Civil ID / mobile"],
            ["walk-in", "Walk-in"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === value ? "bg-ink-900 text-parchment-50" : "text-ink-700/70 hover:bg-ink-900/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "master" && (
        <div className="relative">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
          />
          {term.trim().length >= 2 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-ink-900/10 bg-white shadow-lg">
              {search.isFetching && (
                <p className="px-3 py-2 text-xs text-ink-700/50">Searching…</p>
              )}
              {!search.isFetching && search.data?.length === 0 && (
                <p className="px-3 py-2 text-xs text-ink-700/50">No matching customers</p>
              )}
              {search.data?.map((c) => (
                <button
                  key={c.partyId}
                  type="button"
                  onClick={() => selectMaster(c.partyId)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-parchment-100"
                >
                  <span className="font-medium text-ink-900">{c.name}</span>
                  {c.phone && <span className="ml-2 text-xs text-ink-700/50">{c.phone}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "retail" && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={retailQuery.civilId}
              onChange={(e) => setRetailQuery((q) => ({ ...q, civilId: e.target.value }))}
              placeholder="Civil ID"
              className="flex-1 rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
            />
            <input
              value={retailQuery.mobileNo}
              onChange={(e) => setRetailQuery((q) => ({ ...q, mobileNo: e.target.value }))}
              placeholder="Mobile number"
              className="flex-1 rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
            />
            <Button type="button" variant="secondary" onClick={lookupRetail} loading={retailStatus === "loading"}>
              Look up
            </Button>
          </div>
          {retailStatus === "not-found" && (
            <p className="text-xs text-[#b3432f]">
              No customer found with that civil ID or mobile number — try walk-in instead.
            </p>
          )}
        </div>
      )}

      {mode === "walk-in" && (
        <div className="grid grid-cols-2 gap-2">
          <input
            value={header.customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="Customer name"
            className="rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
          />
          <input
            value={header.customerMobile}
            onChange={(e) => onChange({ customerMobile: e.target.value })}
            placeholder="Mobile number"
            className="rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm focus-visible:border-brass-500"
          />
        </div>
      )}
    </div>
  );
}
