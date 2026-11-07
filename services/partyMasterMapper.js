
const toDateString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value.substring(0, 10);
  if (typeof value?.format === "function") return value.format("YYYY-MM-DD");
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().substring(0, 10);
};

export const buildPartyRequest = (f) => ({
  name: f.clName || "",
  shortName: f.clShortName || null,
  address1: f.clAdd1 || null,
  address2: f.clAdd2 || null,
  address3: f.clAdd3 || null,
  phone: f.clPhone || null,
  fax: f.clCompanyFax || null,
  civilId: f.clCivilId || null,
  civilIdType: Number(f.clCivilIdType || 0),
  civilIdExpiry: toDateString(f.clCivilIdExpDate),
  crNo: f.clCrNo || null,
  crExpiry: toDateString(f.clCrExpDate),
  country: f.clCountry ? String(f.clCountry) : null,
  areaId: f.clAreaId ? String(f.clAreaId) : null,
  currencyId: f.clCurId || null,
  creditDays: Number(f.clCreditDays || 0),
  creditLimit: Number(f.clCreditLimit || 0),
  contactPerson: f.clPerson || null,
  designation: f.clCustDesig || null,
  glAccountNo: f.clActNo ? String(f.clActNo) : null,
  blackListed: String(f.clBlackList || "0") === "1",
  notes: f.clNotes || null,
  status: 0,
});

export const detailToLegacyForm = (d, base) => ({
  ...base,
  clCode: d.partyId || "",
  clName: d.name || "",
  clShortName: d.shortName || "",
  clPerson: d.contactPerson || "",
  clCustDesig: d.designation || "",
  clAdd1: d.address1 || "",
  clAdd2: d.address2 || "",
  clAdd3: d.address3 || "",
  clPhone: d.phone || "",
  clCompanyFax: d.fax || "",
  clAreaId: d.areaId || "",
  clCountry: d.country || "",
  clCivilId: d.civilId || "",
  clCivilIdType: String(d.civilIdType ?? 0),
  clCivilIdExpDate: d.civilIdExpiry || base.clCivilIdExpDate,
  clCrNo: d.crNo || "",
  clCrExpDate: d.crExpiry || base.clCrExpDate,
  clCurId: d.currencyId || "",
  clNotes: d.notes || "",
  clCreditDays: String(d.creditDays ?? ""),
  clCreditLimit: String(d.creditLimit ?? 0),
  clActNo: d.glAccountNo || "",
  clBlackList: d.blackListed ? "1" : "0",
});
