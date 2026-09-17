import { createSimpleMasterHooks } from "./hooks";
import type { MasterFieldDescriptor } from "./MasterMaintenanceView";
import type { PaymentTypeResponse, SavePaymentTypeRequest } from "@/types/masters";

export const paymentTypeHooks = createSimpleMasterHooks<PaymentTypeResponse, SavePaymentTypeRequest>(
  "payment-types",
);

export const emptyPaymentType: SavePaymentTypeRequest = {
  payId: "",
  payName: "",
  payNameArabic: "",
  amountType: 0,
  percentage: 0,
  amount: 0,
  receiptAccountNo: "",
  paymentAccountNo: "",
  typeFlag: 0,
  orderNo: 0,
  status: 0,
};

export function paymentTypeToSaveRequest(r: PaymentTypeResponse): SavePaymentTypeRequest {
  return {
    payId: r.payId,
    payName: r.payName,
    payNameArabic: r.payNameArabic ?? "",
    amountType: r.amountType,
    percentage: r.percentage,
    amount: r.amount,
    receiptAccountNo: r.receiptAccountNo ?? "",
    paymentAccountNo: r.paymentAccountNo ?? "",
    typeFlag: r.typeFlag,
    orderNo: r.orderNo,
    status: r.status,
    // Note: `locationId` on the response isn't part of SavePaymentTypeRequest
    // at all — it's assigned server-side from the signed-in session context,
    // not user-editable. Nothing dropped here, just not present to begin with.
  };
}

// `amountType` and `typeFlag` are legacy byte codes with no code list
// available from the API (same situation as transactionTypeId/makingTypeId
// on sales invoice lines) — left as plain numbers rather than a dropdown
// with guessed labels. Confirm the real meaning before relying on this.
export const paymentTypeFields: MasterFieldDescriptor<SavePaymentTypeRequest>[] = [
  { key: "payId", label: "Code", type: "text", maxLength: 2, disabledOnEdit: true },
  { key: "payName", label: "Name", type: "text", maxLength: 30 },
  { key: "payNameArabic", label: "Name (Arabic)", type: "text", maxLength: 30 },
  { key: "amountType", label: "Amount type (code)", type: "number" },
  { key: "percentage", label: "Percentage", type: "number", step: 0.01 },
  { key: "amount", label: "Fixed amount", type: "number", step: 0.001 },
  { key: "receiptAccountNo", label: "Receipt account no.", type: "text", maxLength: 25 },
  { key: "paymentAccountNo", label: "Payment account no.", type: "text", maxLength: 20 },
  { key: "typeFlag", label: "Type flag (code)", type: "number" },
  { key: "orderNo", label: "Display order", type: "number" },
  {
    key: "status",
    label: "Status",
    type: "select",
    parseNumber: true,
    options: [
      { value: "0", label: "Active" },
      { value: "1", label: "Inactive" },
    ],
  },
];
