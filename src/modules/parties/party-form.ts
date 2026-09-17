import type { PartyDetailResponse, SavePartyRequest } from "@/types/catalog";
import type { ValidationError } from "@/types/common";

export function createEmptyParty(defaults: { currencyId: string }): SavePartyRequest {
  return {
    name: "",
    nameArabic: "",
    shortName: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
    fax: "",
    civilId: "",
    civilIdType: null,
    civilIdExpiry: null,
    crNo: "",
    crExpiry: null,
    country: "",
    areaId: "",
    currencyId: defaults.currencyId,
    creditDays: 0,
    creditLimit: 0,
    contactPerson: "",
    designation: "",
    glAccountNo: "",
    blackListed: false,
    purePurity: 0,
    transferCharges: 0,
    licenseNo: "",
    civilLicenseNo: "",
    notes: "",
    status: 0,
    gender: "",
    dateOfBirth: null,
    kycArea: "",
    kycCountry: "",
    block: "",
    jedah: "",
    street: "",
    building: "",
    floor: "",
    flat: "",
    paciNo: "",
  };
}

/**
 * `PartyDetailResponse` (the GET shape) doesn't include several fields that
 * `SavePartyRequest` (the PUT/POST shape) accepts — gender, dateOfBirth,
 * kycArea, kycCountry, block, jedah, street, building, floor, flat, paciNo.
 * They're write-only from this API as it stands. Editing an existing
 * customer therefore can't know their current values for those fields; the
 * form starts them blank and the "KYC / additional details" section on the
 * edit screen carries an explicit warning rather than silently risking a
 * blank overwrite. Worth a follow-up with the API owner: either return
 * these on GET, or support a partial update.
 */
export function partyToFormValues(detail: PartyDetailResponse): SavePartyRequest {
  return {
    name: detail.name,
    nameArabic: detail.nameArabic ?? "",
    shortName: detail.shortName ?? "",
    address1: detail.address1 ?? "",
    address2: detail.address2 ?? "",
    address3: detail.address3 ?? "",
    phone: detail.phone ?? "",
    fax: detail.fax ?? "",
    civilId: detail.civilId ?? "",
    civilIdType: detail.civilIdType ?? null,
    civilIdExpiry: detail.civilIdExpiry ?? null,
    crNo: detail.crNo ?? "",
    crExpiry: detail.crExpiry ?? null,
    country: detail.country ?? "",
    areaId: detail.areaId ?? "",
    currencyId: detail.currencyId ?? "",
    creditDays: detail.creditDays,
    creditLimit: detail.creditLimit,
    contactPerson: detail.contactPerson ?? "",
    designation: detail.designation ?? "",
    glAccountNo: detail.glAccountNo ?? "",
    blackListed: detail.blackListed,
    purePurity: detail.purePurity,
    transferCharges: detail.transferCharges,
    licenseNo: detail.licenseNo ?? "",
    civilLicenseNo: detail.civilLicenseNo ?? "",
    notes: detail.notes ?? "",
    status: detail.status,
    // Not returned by GET /customers/{id} — see doc comment above.
    gender: "",
    dateOfBirth: null,
    kycArea: "",
    kycCountry: "",
    block: "",
    jedah: "",
    street: "",
    building: "",
    floor: "",
    flat: "",
    paciNo: "",
  };
}

/**
 * Mirrors `PartyValidator.Validate` exactly (see
 * Matrix.Api/Services/Validation/PartyValidator.cs) so the cashier sees the
 * same errors before submitting that the server would return after. The
 * server remains the source of truth — this is a client-side convenience,
 * not a replacement for server validation.
 */
export function validateParty(request: SavePartyRequest): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!request.name.trim()) errors.push({ code: "PARTY_NAME_REQUIRED", message: "Name is required." });
  if (request.creditDays < 0)
    errors.push({ code: "CREDIT_DAYS_INVALID", message: "Credit days cannot be negative." });
  if (request.creditLimit < 0)
    errors.push({ code: "CREDIT_LIMIT_INVALID", message: "Credit limit cannot be negative." });
  if (request.purePurity < 0)
    errors.push({ code: "PURITY_INVALID", message: "Pure purity cannot be negative." });
  if (request.transferCharges < 0)
    errors.push({ code: "TRANSFER_CHARGES_INVALID", message: "Transfer charges cannot be negative." });
  if (request.status > 1)
    errors.push({ code: "PARTY_STATUS_INVALID", message: "Status must be 0 or 1." });
  if (request.civilId && request.civilId.trim().length > 15) {
    errors.push({
      code: "CIVIL_ID_TOO_LONG",
      message: "Civil ID cannot exceed 15 characters (legacy rfParty column limit).",
    });
  }
  return errors;
}
