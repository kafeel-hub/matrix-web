import SimpleMasterPage from "../../components/Master/SimpleMasterPage";

export default function PaymentTypeMaster() {
  const accountLookup = {
    optionsPath: "payment-types/accounts",
    optionValue: "accountNo",
    optionLabel: "accountName",
    optionLabel2: true,
  };

  const fields = [
    { key: "payId", label: "Payment Type ID", required: true },
    { key: "payName", label: "Payment Type Name", required: true },
    { key: "payNameArabic", label: "Name (Arabic)" },
    { key: "amountType", label: "Amount Type", number: true, default: 0 },
    { key: "percentage", label: "Percentage", number: true, default: 0 },
    { key: "amount", label: "Amount", number: true, default: 0 },
    { key: "receiptAccountNo", label: "Receipt Account", ...accountLookup },
    { key: "paymentAccountNo", label: "Payment Account", ...accountLookup },
    { key: "typeFlag", label: "Type Flag", number: true, default: 0 },
    { key: "orderNo", label: "Order No", number: true, default: 0 },
    { key: "status", label: "Status", number: true, default: 0, options: [{ value: 0, label: "Active" }, { value: 1, label: "De-Active" }], display: v => Number(v) === 0 ? "Active" : "De-Active" },
  ];

  return <SimpleMasterPage title="Payment Type" path="payment-types" idKey="payId" fields={fields} />;
}
