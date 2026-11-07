import { React, useMemo } from "react";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Box,
} from "@mui/material";
import {
  // LocalizationProvider,
  DatePicker,
} from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CustomInput, CustomSelect } from "../Customcomponents/CustomInputs";
import CustomDropdown from "../Customcomponents/CustomDropdown";
import CustomDatePicker from "../Customcomponents/CustomDatePicker";
import goldIcon from "../../assets/images/gold-bar.png";
import cashIcon from "../../assets/images/cash-payment.png";

const CustomerDetailVoucherForm = (props) => {
  const {
    data,
    formData,
    errors,
    onFormChange,
    type,
    invoice,
    currencyList,
    accountType,
    comboBox,
    accountSearchAction,
    accountBalance,
  accountLabel = "Received Account",
  contraAccountLabel = "Recieved From",
  } = props;

  const payFrom = [
    { lbl: "Cash", val: "Cash" },
    { lbl: "Bank", val: "Bank" },
  ];

  const fieldName =
    type == "UGLP" || type == "GI" || type == "GR"
      ? "contactPerson"
      : "customerName";
  console.log(accountType, "accounttype");
  // Build account map and options for dropdowns (defensive parsing)
  // accountType items are expected to have fldID and fldDisplay (eg "100011 zahir account")
  // const { accountOptionsWithLabel, accountMap } = React.useMemo(() => {
  //   const map = {};
  //   const options = [];

  //   if (Array.isArray(accountType)) {
  //     accountType.forEach((item) => {
  //       const fldID = String(item?.fldID ?? "");
  //       const fldDisplay = String(item?.fldDisplay ?? "").trim();

  //       const firstToken = fldDisplay.split(/\s+/)[0] || fldID;
  //       const parsedAccountNo = /\d/.test(firstToken) ? firstToken : fldID;
  //       const parsedAccountName =
  //         fldDisplay.startsWith(parsedAccountNo) &&
  //         fldDisplay.length > parsedAccountNo.length
  //           ? fldDisplay.slice(parsedAccountNo.length).trim()
  //           : fldDisplay || "";

  //       map[parsedAccountNo] = parsedAccountName;

  //       const labelToShow =
  //         fldDisplay && fldDisplay.indexOf(parsedAccountNo) !== -1
  //           ? fldDisplay
  //           : `${parsedAccountNo} ${parsedAccountName}`.trim();

  //       options.push({ label: labelToShow, value: parsedAccountNo });
  //     });
  //   }

  //   return { accountOptionsWithLabel: options, accountMap: map };
  // }, [accountType]);
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
  return (
    <Grid container spacing={1} sx={{ flexGrow: 1, p: 1 }}>
      {/* Left 80% content */}
      <Grid size={{ xs: 12, md: 10, lg: 10 }}>
        <Grid container spacing={1}>
          {type === "PCE" ? (
            <>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                {/* Account Number dropdown shows both id + name in label */}
                <CustomDropdown
                  value={
                    accountOptionsWithLabel
                      .map((item) => ({ value: item.value, label: item.value }))
                      .find((opt) => opt.value === formData.paidAccNo) || null
                  }
                  options={accountOptionsWithLabel}
                  onChange={(event, newValue) => {
                    const accountNo = newValue?.value ?? "";
                    const accountName = accountMap[accountNo] ?? "";

                    onFormChange("paidAccNo", accountNo);
                    onFormChange("paidAccName", accountName);
                  }}
                  placeholder="Select Account"
                  label="Select Account"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Paid Account Name"
                  name="paidAccName"
                  value={formData.paidAccName}
                  onChange={(e) => onFormChange("paidAccName", e.target.value)}
                  error={!!errors.paidAccName}
                  helperText={errors.paidAccName}
                />
                {/* If you want to force strict sync (prevent editing), add disabled prop:
                    <CustomInput ... disabled /> */}
              </Grid>
            </>
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => onFormChange("mobile", e.target.value)}
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomDropdown
                  label={accountLabel}
                  value={
                    formData.recievedAccount
                      ? accountOptionsWithLabel.find(
                          (opt) => opt.value === formData.recievedAccount
                        ) || null
                      : null
                  }
                  options={accountOptionsWithLabel.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  serverSideSearch={!!accountSearchAction}
                  callFilterAction={accountSearchAction}
                  onChange={(e, newValue) => {
                    const recievedAcc = newValue?.value ?? "";
                    onFormChange("recievedAccount", recievedAcc);
                  }}
                  error={!!errors.recievedAccount}
                  helperText={errors.recievedAccount}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomDropdown
                  label={contraAccountLabel}
                  value={
                    formData.recievedFrom
                      ? accountOptionsWithLabel.find(
                          (opt) => opt.value === formData.recievedFrom
                        ) || null
                      : null
                  }
                  options={accountOptionsWithLabel.map((item) => ({
                    value: item.value,
                    label: item.label || item.value,
                  }))}
                  serverSideSearch={!!accountSearchAction}
                  callFilterAction={accountSearchAction}
                  onChange={(e, newValue) => {
                    const recievedFrom = newValue?.value ?? "";
                    onFormChange("recievedFrom", recievedFrom);
                  }}
                  error={!!errors.recievedFrom}
                  helperText={errors.recievedFrom}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomSelect
                  label="Salesman"
                  value={formData.salesman}
                  onChange={(e) => onFormChange("salesman", e.target.value)}
                  options={
                    data?.salesman?.map((item) => ({
                      value: item.fldID,
                      label: item.fldDisplay,
                    })) || []
                  }
                  error={!!errors.salesman}
                  helperText={errors.salesman}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
            <CustomDatePicker
              value={formData.date}
              onChange={(newValue) => onFormChange("date", newValue)}
              errors={errors}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
            <CustomInput
              label="Ref No"
              name="refNo"
              value={formData.refNo}
              onChange={(e) => onFormChange("refNo", e.target.value)}
              error={!!errors.refNo}
              helperText={errors.refNo}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
            <CustomInput
              label="Remark"
              name="remark"
              value={formData.remark}
              onChange={(e) => onFormChange("remark", e.target.value)}
              error={!!errors.remark}
              helperText={errors.remark}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Right 20% sidebar */}
      <Grid size={{ xs: 12, md: 2, lg: 2 }} offset={{ xs: 0, md: 0, lg: 0 }}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            backgroundColor: "#f4f4f4",
            p: 2,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {type === "PCE" ? "Current Balance" : "Outstanding Balance"}
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} sx={{ display: "flex" }}>
              <img
                src={cashIcon}
                alt="Amount Icon"
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 8,
                }}
              />
              <Typography variant="body1" sx={{ alignContent: "center" }}>
                : {accountBalance?.amountBalance ?? formData.amount ?? "0"} KD
              </Typography>
            </Grid>
            {type !== "PCE" && (
              <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                <img
                  src={goldIcon}
                  alt="Gold Icon"
                  style={{
                    width: 40,
                    height: 40,
                    marginRight: 8,
                  }}
                />
                <Typography variant="body1" sx={{ alignContent: "center" }}>
                  : {accountBalance?.goldBalance ?? formData.gold ?? "0"} GM
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default CustomerDetailVoucherForm;
