import React, { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@mui/material";
import CustomModal from "../Customcomponents/CustomModal";
import { CustomInput } from "../Customcomponents/CustomInputs";
import CustomDropdown from "../Customcomponents/CustomDropdown";
import CustomDatePicker from "../Customcomponents/CustomDatePicker";
import Grid from "@mui/material/Grid2";

function AddItemForm({
  modalOpen,
  setModalOpen,
  formData,
  setFormData,
  onFormChange,
  errors,
  fields,
  handleSubmit,
  resetState,
  loading = false,
  setErrors,
  currentItemEdit,
  paymentOptions,
  accountType,
  currencyList,
  CompanyDetails,
  accountSearchAction,
  restrictAccountToPaymentType = false,
  baseCurrencyId = "",
}) {
  const [date, setDate] = useState(null);
  console.log(formData, "formData table");
  const { accountOptionsWithLabel, accountMap } = useMemo(() => {
    const map = {};
    const options = [];
    console.log(accountType, "accountType");
    if (Array.isArray(accountType)) {
      accountType.forEach((item) => {
        const fldID = String(item?.value ?? item?.fldID ?? "");
        const fldDisplay = String(item?.label ?? item?.fldDisplay ?? "").trim();

        const firstToken = fldDisplay.split(/\s+/)[0] || fldID;
        const parsedAccountNo = /\d/.test(firstToken) ? firstToken : fldID;
        const parsedAccountName =
          fldDisplay.startsWith(parsedAccountNo) &&
          fldDisplay.length > parsedAccountNo.length
            ? fldDisplay.slice(parsedAccountNo.length).trim()
            : fldDisplay || "";

        map[parsedAccountNo] = parsedAccountName;
        console.log(parsedAccountName, ",parsed option");

        const labelToShow = `${parsedAccountName}`.trim();
        console.log(labelToShow, ",parsed labelToShow");

        options.push({ label: labelToShow, value: parsedAccountNo });
      });
    }

    return { accountOptionsWithLabel: options, accountMap: map };
  }, [accountType]);

  const selectedPaymentOption = useMemo(
    () => paymentOptions?.find((option) => String(option.value) === String(formData?.paytype)) || null,
    [paymentOptions, formData?.paytype]
  );

  // Legacy RV behaviour: PayId resolves the receipt-side PayActNo/PayActName
  // from vw_PayTypeFile for the current location. Do not show the generic
  // header account list inside the payment popup when this mode is enabled.
  const paymentAccountOptions = useMemo(() => {
    if (!restrictAccountToPaymentType) return accountOptionsWithLabel;
    const accountNo = String(selectedPaymentOption?.AccountNo || "").trim();
    if (!accountNo) return [];
    return [{
      value: accountNo,
      label: String(selectedPaymentOption?.AccountName || accountMap[accountNo] || accountNo).trim(),
    }];
  }, [restrictAccountToPaymentType, selectedPaymentOption, accountOptionsWithLabel, accountMap]);

  const fallbackOption = formData.account
    ? {
        label: accountMap[formData.account] ?? formData.account,
        value: formData.account,
      }
    : null;
  useEffect(() => {
    if (formData?.currency) return;
    if (!currencyList || currencyList.length === 0) return;

    const compCurrencyId = (
      baseCurrencyId ||
      CompanyDetails?.dtcurrency?.CurrencyId ||
      (Array.isArray(CompanyDetails?.dtCurrency) &&
        CompanyDetails.dtCurrency[0]?.CurrencyId) ||
      CompanyDetails?.CurrencyId ||
      ""
    ).toString();

    const compCurrencyName = (
      CompanyDetails?.dtcurrency?.CurrencyName ||
      CompanyDetails?.dtCurrency?.[0]?.CurrencyName ||
      CompanyDetails?.[0]?.CurrencyName ||
      CompanyDetails?.CurrencyName ||
      ""
    )
      .toString()
      .trim()
      .toLowerCase();

    let match =
      (compCurrencyId &&
        currencyList.find(
          (o) =>
            (o.value || "").toString().toLowerCase() ===
            compCurrencyId.toLowerCase()
        )) ||
      (compCurrencyName &&
        currencyList.find(
          (o) => (o.label || "").toString().toLowerCase() === compCurrencyName
        ));

    match = match || currencyList.find((o) => o?.raw?.isBaseCurrency) || currencyList[0];

    if (match) {
      setFormData((prev) => ({
        ...prev,
        currency: match,
        exchangerate: 1,
      }));
      setErrors && setErrors((prev) => ({ ...prev, currency: "", exRate: "" }));
    }
  }, [
    currencyList,
    CompanyDetails,
    baseCurrencyId,
    formData?.currency,
    setFormData,
    setErrors,
  ]);

  const handleSelectChange = (key, value) => {
    if (!value) {
      setFormData((prev) => ({ ...prev, [key]: "" }));
      setErrors && setErrors((prev) => ({ ...prev, [key]: "" }));
      return;
    }

    if (key === "account") {
      const accountNo = value.value;
      const accountName = accountMap[accountNo] || "";

      setFormData((prev) => ({
        ...prev,
        account: accountNo,
        accountName,
      }));
      setErrors &&
        setErrors((prev) => ({ ...prev, account: "", accountName: "" }));
    } else if (key === "currency") {
      const raw = value.raw || value;
      const foundRate =
        raw.ExRate ?? raw.exRate ?? raw.ExchangeRate ?? raw.rate ?? 1;
      const rate = Number(foundRate) || 1;
      setFormData((prev) => ({
        ...prev,
        [key]: value,
        exchangerate: rate,
        amountFC: Number(prev.amountLC || 0) / rate,
      }));
    } else if (key === "paytype") {
      const selectedPayment = value;

      // Legacy RV: payment type controls the receipt-side payment account.
      // Always replace the previous account so a stale account from another
      // payment type can never remain selected.
      const accountNo = String(selectedPayment?.AccountNo || "").trim();
      const accountName = String(
        selectedPayment?.AccountName || accountMap[accountNo] || ""
      ).trim();

      setFormData((prev) => ({
        ...prev,
        paytype: selectedPayment.value,
        account: accountNo || "",
        accountName: accountName || "",
      }));

      setErrors &&
        setErrors((prev) => ({
          ...prev,
          paytype: "",
          account: "",
          accountName: "",
        }));
    } else {
      const newVal =
        typeof value === "object" && value !== null ? value.value || "" : value;

      setFormData((prev) => ({
        ...prev,
        [key]: newVal,
      }));
    }

    setErrors && setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const renderField = (field) => {
    if (field.inputType === "dropdown") {
      if (field.key === "account") {
        return (
          <CustomDropdown
            key={field.key}
            label={field.label}
            value={
              paymentAccountOptions.find(
                (opt) => opt.value === String(formData.account).trim()
              ) || null
            }
            onChange={(_, value) => handleSelectChange(field.key, value)}
            options={paymentAccountOptions}
            serverSideSearch={!restrictAccountToPaymentType && !!accountSearchAction}
            callFilterAction={restrictAccountToPaymentType ? undefined : accountSearchAction}
            getOptionLabel={(option) => {
              if (!option) return "";
              if (typeof option === "string") return option;
              if (typeof option === "object") {
                if (option.label && option.value)
                  return `${option.value} - ${option.label}`;
                return option.label || option.value || "";
              }
              return String(option);
            }}
            error={!!errors[field.key]}
            helperText={errors[field.key]}
          />
        );
      } else if (field.key === "currency") {
        return (
          <CustomDropdown
            key={field.key}
            label={field.label}
            value={formData[field.key] ?? ""}
            onChange={(_, value) => handleSelectChange(field.key, value)}
            options={currencyList}
            error={!!errors[field.key]}
            helperText={errors[field.key]}
          />
        );
      } else if (field.key === "paytype") {
        return (
          <CustomDropdown
            key={field.key}
            label={field.label}
            value={
              paymentOptions?.find(
                (option) => option.value === formData[field.key]
              ) || null
            }
            onChange={(_, value) => handleSelectChange(field.key, value)}
            options={paymentOptions}
            error={!!errors[field.key]}
            helperText={errors[field.key]}
          />
        );
      }
    }

    if (field.key === "accountName") {
      return (
        <CustomInput
          key={field.key}
          label={field.label}
          name={field.key}
          value={formData.accountName ?? ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, accountName: e.target.value }))
          }
          error={!!errors[field.key]}
          helperText={errors[field.key]}
          disabled={field.disabled}
        />
      );
    }
    if (field.key === "amountLC") {
      return (
        <CustomInput
          key={field.key}
          label={field.label}
          name={field.key}
          value={formData.amountLC ?? ""}
          onChange={(e) => {
            const { name, value } = e.target;

            // 1️⃣ Update local formData
            setFormData((prev) => ({
              ...prev,
              [name]: value,
            }));

            // 2️⃣ Call the parent's handler for recalculation
            if (onFormChange) {
              onFormChange(e);
            }
          }}
          error={!!errors[field.key]}
          helperText={errors[field.key]}
          disabled={field.disabled}
        />
      );
    }
    if (field.key === "cheaquedate") {
      return (
        <CustomDatePicker
          value={formData.cheaquedate || null}
          onChange={(value) => setFormData((prev) => ({ ...prev, cheaquedate: value }))}
        />
      );
    }
    return (
      <CustomInput
        key={field.key}
        label={field.label}
        name={field.key}
        value={formData[field.key] ?? ""}
        onChange={field.disabled ? undefined : onFormChange}
        error={!!errors[field.key]}
        helperText={errors[field.key]}
        disabled={field.disabled}
      />
    );
  };

  return (
    <CustomModal
      submitButtonText={`${currentItemEdit !== null ? "Update" : "Add"}`}
      open={modalOpen}
      onClose={() => {
        setModalOpen(false);
        resetState();
      }}
      title={`${currentItemEdit !== null ? "Update payment" : "Add Payment"}`}
      onSubmit={handleSubmit}
    >
      {loading ? (
        <ItemDetailsFormSkeleton fields={fields} />
      ) : (
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          {fields?.map((field) => (
            <Grid
              size={{ xs: 12, md: field.md || 6, lg: field.lg || 6 }}
              key={field.key}
            >
              {renderField(field)}
            </Grid>
          ))}
        </Grid>
      )}
    </CustomModal>
  );
}

export default AddItemForm;

// Skeleton loader
const ItemDetailsFormSkeleton = ({ fields }) => {
  return (
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid
          size={{ xs: 12, md: field.md || 6, lg: field.lg || 6 }}
          key={field.key}
        >
          <Skeleton variant="rectangular" width="100%" height={45} />
        </Grid>
      ))}
    </Grid>
  );
};
