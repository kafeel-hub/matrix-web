import { apiClient } from "@/api/client";
import type { InvoiceItemResponse, ItemLookupResponse, CustomerLookupResponse } from "@/types/catalog";
import type { PartyDetailResponse, PartySummaryResponse } from "@/types/catalog";

/** GET /api/items/scan/{itemCode} — full detail for a scanned barcode or item code. */
export async function scanItem(itemCode: string): Promise<InvoiceItemResponse | null> {
  try {
    const { data } = await apiClient.get<InvoiceItemResponse>(
      `/items/scan/${encodeURIComponent(itemCode)}`,
    );
    return data;
  } catch (error) {
    if (isAxiosNotFound(error)) return null;
    throw error;
  }
}

/** GET /api/items/search?term= — lightweight id/name suggestions while typing. */
export async function searchItems(term: string): Promise<ItemLookupResponse[]> {
  const { data } = await apiClient.get<ItemLookupResponse[]>("/items/search", {
    params: { term },
  });
  return data;
}

/** GET /api/customers?term=&take= — master customer (Prt_Type=1) search. */
export async function searchCustomers(term: string, take = 10): Promise<PartySummaryResponse[]> {
  const { data } = await apiClient.get<PartySummaryResponse[]>("/customers", {
    params: { term, take },
  });
  return data;
}

/** GET /api/customers/{customerId} — full master record, used to prefill the invoice header. */
export async function getCustomer(customerId: string): Promise<PartyDetailResponse | null> {
  try {
    const { data } = await apiClient.get<PartyDetailResponse>(
      `/customers/${encodeURIComponent(customerId)}`,
    );
    return data;
  } catch (error) {
    if (isAxiosNotFound(error)) return null;
    throw error;
  }
}

/** GET /api/customers/search?civilId=&mobileNo= — retail/KYC quick lookup (rfCustomerInfo). */
export async function searchRetailCustomer(params: {
  civilId?: string;
  mobileNo?: string;
}): Promise<CustomerLookupResponse | null> {
  try {
    const { data } = await apiClient.get<CustomerLookupResponse>("/customers/search", {
      params,
    });
    return data;
  } catch (error) {
    if (isAxiosNotFound(error)) return null;
    throw error;
  }
}

function isAxiosNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
}
