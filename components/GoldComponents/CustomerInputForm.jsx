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
import {
  CustomInput,
  CustomSelect,
  CustomSearchableDropdown,
} from "../Customcomponents/CustomInputs";
import CustomDropdown from "../Customcomponents/CustomDropdown";
import CustomDatePicker from "../Customcomponents/CustomDatePicker";
import goldIcon from "../../assets/images/gold-bar.png";
import cashIcon from "../../assets/images/cash-payment.png";

const CustomerInputForm = (props) => {
  const {
    data,
    formData,
    errors,
    onFormChange,
    type,
    invoice,
    currencyList,
    partylist,
    callFilterAction,
    options,
    filteredPartyItems,
    goldPurities,
    accountBalance,
  } = props;
  console.log(filteredPartyItems, "formdata");
  const purityOptions = (Array.isArray(goldPurities) && goldPurities.length ? goldPurities : [999, 999.9, 995]).map((x) => ({ lbl: x, val: x }));
  const fieldName =
    type == "UGLP" || type == "GI" || type == "GR"
      ? "contactPerson"
      : "customerName";
  console.log(filteredPartyItems, "options");
  const { partyOptionsWithLabel, partyMap } = useMemo(() => {
    const map = {};
    const options = [];

    if (Array.isArray(filteredPartyItems)) {
      filteredPartyItems.forEach((item) => {
        const fldID = String(item?.Prt_Id ?? "");
        const fldDisplay = String(item?.Prt_Name ?? "").trim();

        const firstToken = fldDisplay.split(/\s+/)[0] || fldID;
        const parsedPartyId = /\d/.test(firstToken) ? firstToken : fldID;
        const parsedPartyName =
          fldDisplay.startsWith(parsedPartyId) &&
          fldDisplay.length > parsedPartyId.length
            ? fldDisplay.slice(parsedPartyId.length).trim()
            : fldDisplay || "";

        // store mapping of accountNo -> accountName
        map[parsedPartyId] = parsedPartyName;

        const labelToShow =
          fldDisplay && fldDisplay.indexOf(parsedPartyId) !== -1
            ? fldDisplay
            : `${parsedPartyId} ${parsedPartyName}`.trim();

        options.push({ label: labelToShow, value: parsedPartyId });
      });
    }

    return { partyOptionsWithLabel: options, partyMap: map };
  }, [filteredPartyItems]);
  const { supplierOptionsWithLabel, supplierMap } = useMemo(() => {
    const map = {};
    const options = [];

    if (Array.isArray(data?.supplier)) {
      data?.supplier?.forEach((item) => {
        const fldID = String(item?.fldID ?? "");
        const fldDisplay = String(item?.fldDisplay ?? "").trim();

        const firstToken = fldDisplay.split(/\s+/)[0] || fldID;
        const parsedSupplierId = /\d/.test(firstToken) ? firstToken : fldID;
        const parsedsupplierName =
          fldDisplay.startsWith(parsedSupplierId) &&
          fldDisplay.length > parsedSupplierId.length
            ? fldDisplay.slice(parsedSupplierId.length).trim()
            : fldDisplay || "";

        map[parsedSupplierId] = parsedsupplierName;

        const labelToShow =
          fldDisplay && fldDisplay.indexOf(parsedSupplierId) !== -1
            ? fldDisplay
            : `${parsedSupplierId} ${parsedsupplierName}`.trim();

        options.push({ label: labelToShow, value: parsedSupplierId });
      });
    }

    return { supplierOptionsWithLabel: options, supplierMap: map };
  }, [data?.supplier]);
  return (
    <Grid container spacing={1} sx={{ flexGrow: 1, p: 1 }}>
      <Grid size={{ xs: 12, md: 10, lg: 10 }}>
        <Grid container spacing={1}>
          {/* <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
            <CustomInput
              label={
                type == "returnInvoice"
                  ? "Return Invoice Number"
                  : "Invoice Number"
              }
              name="invoice-no"
              value={formData.invoiceNo}
              onChange={(e) => onFormChange("invoiceNo", e.target.value)}
              error={!!errors.invoiceNo}
              helperText={errors.invoiceNo}
              disabled={true}
            />
          </Grid> */}
          <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
            <CustomDatePicker
              value={formData.date}
              onChange={(newValue) => onFormChange("date", newValue)}
              errors={errors}
            />
          </Grid>
          {(type == "GI" || type == "GR") && (
            <>
              {/* <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label=" Supplier Ref No"
                  name="supplierRef"
                  value={formData.supplierRef}
                  onChange={(e) => onFormChange("supplierRef", e.target.value)}
                  error={!!errors.supplierRef}
                  helperText={errors.supplierRef}
                />
              </Grid> */}
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomDropdown
                  key={filteredPartyItems}
                  label=" Select Party"
                  value={
                    filteredPartyItems
                      ?.map((item) => ({
                        // value: item.Prt_Id,
                        label: item.Prt_Id,
                      }))
                      .find((opt) => opt.label === formData.party) || null
                  }
                  onChange={(event, newValue) =>
                    onFormChange("party", newValue?.value || "")
                  }
                  options={filteredPartyItems?.map((item) => ({
                    value: item.Prt_Id,
                    label: item.Prt_Name,
                  }))}
                  callFilterAction={callFilterAction}
                  error={!!errors.party}
                  helperText={errors.party}
                  placeholder="Select Party"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Party Name"
                  name="partyName"
                  value={formData.partyName}
                  onChange={(e) => onFormChange("partyName", e.target.value)}
                  error={!!errors.partyName}
                  helperText={errors.partyName}
                />
              </Grid>
            </>
          )}
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
            {type == "UGLP" || type == "GI" || type == "GR" ? (
              <CustomInput
                label={
                  type == "UGLP" || type == "GI" || type == "GR"
                    ? "Contact Person"
                    : "Customer Name"
                }
                name={
                  type == "UGLP" || type == "GI" || type == "GR"
                    ? "contactPerson"
                    : "customerName"
                }
                value={
                  type == "UGLP" || type == "GI" || type == "GR"
                    ? formData.contactPerson
                    : formData.customerName
                }
                onChange={(e) => onFormChange(fieldName, e.target.value)}
                error={
                  type == "UGLP" || type == "GI" || type == "GR"
                    ? !!errors.contactPerson
                    : !!errors.customerName
                }
                helperText={
                  type == "UGLP" || type == "GI" || type == "GR"
                    ? errors.contactPerson
                    : errors.customerName
                }
              />
            ) : (
              <>
                <CustomDropdown
                  key={data?.supplier}
                  label=" Select Supplier"
                  value={
                    data?.supplier
                      ?.map((item) => ({
                        // value: item.fldID,
                        label: item.fldID,
                      }))
                      .find((opt) => opt.label === formData.supplier) || null
                  }
                  onChange={(event, newValue) =>
                    onFormChange("supplier", newValue?.value || "")
                  }
                  options={data?.supplier?.map((item) => ({
                    value: item.fldID,
                    label: item.fldDisplay,
                  }))}
                  callFilterAction={callFilterAction}
                  error={!!errors.supplier}
                  helperText={errors.supplier}
                  placeholder="Select Supplier"
                />
              </>
            )}
          </Grid>
          {type !== "UGLP" && type !== "GI" && type !== "GR" && (
            <Grid item xs={12} sm={5} md={3} lg={3}>
              <CustomInput
                label="Supplier Name"
                name="supplierName"
                value={formData.supplierName}
                onChange={(e) => onFormChange("supplierName", e.target.value)}
                error={!!errors.supplierName}
                helperText={errors.supplierName}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
            <CustomInput
              label="Civil Id"
              name="civilId"
              value={formData.civilId}
              onChange={(e) => onFormChange("civilId", e.target.value)}
              error={!!errors.civilId}
              helperText={errors.civil_id}
            />
          </Grid>
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

          {type !== "GFS" && type !== "GFP" && (
            <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
              <CustomInput
                label="Customer Phone"
                name="customerPhone"
                type="number"
                value={formData.customerPhone}
                onChange={(e) => onFormChange("customerPhone", e.target.value)}
                error={!!errors.customerPhone}
                helperText={errors.customerPhone}
              />
            </Grid>
          )}
          {(type == "GI" || type == "UGLP" || type == "GR") && (
            <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
              <CustomInput
                label="Company CR NO."
                name="companyCRNo"
                value={formData.companyCRNo}
                onChange={(e) => onFormChange("companyCRNo", e.target.value)}
                error={!!errors.companyCRNo}
                helperText={errors.companyCRNo}
              />
            </Grid>
          )}

          {(type == "GFS" || type == "GFP") && (
            <>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomSelect
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => onFormChange("currency", e.target.value)}
                  options={
                    currencyList?.dtCurrency?.map((item) => ({
                      value: item.CurId,
                      label: item.CurName,
                    })) || []
                  }
                  error={!!errors.currency}
                  helperText={errors.currency}
                />
              </Grid>
              {/* {type !== "GFS" && (
                <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                  <CustomInput
                    label="Voucher No"
                    name="voucherNo"
                    value={formData.voucherNo}
                    onChange={(e) => onFormChange("voucherNo", e.target.value)}
                    error={!!errors.voucherNo}
                    helperText={errors.voucherNo}
                  />
                </Grid>
              )} */}

              {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <CustomInput
                label="Customer"
                name="customer"
                value={formData.customer}
                onChange={(e) => onFormChange("customer", e.target.value)}
                error={!!errors.customer}
                helperText={errors.customer}
              />
            </Grid> */}
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Ex Rate"
                  name="exRate"
                  value={formData.exRate}
                  onChange={(e) => onFormChange("exRate", e.target.value)}
                  error={!!errors.exRate}
                  helperText={errors.exRate}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Price/Grm"
                  name="pricePerGrm"
                  value={formData.pricePerGrm}
                  onChange={(e) => onFormChange("pricePerGrm", e.target.value)}
                  error={!!errors.pricePerGrm}
                  helperText={errors.pricePerGrm}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomSelect
                  label="Gold Purity"
                  value={formData.pureGoldPurity}
                  onChange={(e) =>
                    onFormChange("pureGoldPurity", e.target.value)
                  }
                  options={
                    purityOptions?.map((item) => ({
                      value: item.val,
                      label: item.lbl,
                    })) || []
                  }
                  error={!!errors.pureGoldPurity}
                  helperText={errors.pureGoldPurity}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Gold Weight"
                  name="goldWeight"
                  value={formData.goldWeight}
                  onChange={(e) => onFormChange("goldWeight", e.target.value)}
                  error={!!errors.goldWeight}
                  helperText={errors.goldWeight}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Fixing Amount"
                  name="jedda"
                  value={formData.fixingAmount}
                  onChange={(e) => onFormChange("fixingAmount", e.target.value)}
                  error={!!errors.fixingAmount}
                  helperText={errors.fixingAmount}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Making Amount"
                  name="makingAmount"
                  value={formData.makingAmount}
                  onChange={(e) => onFormChange("makingAmount", e.target.value)}
                  error={!!errors.makingAmount}
                  helperText={errors.makingAmount}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3, lg: 3 }}>
                <CustomInput
                  label="Total Amount"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={(e) => onFormChange("totalAmount", e.target.value)}
                  error={!!errors.totalAmount}
                  helperText={errors.totalAmount}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Grid>

      <Grid item xs={12} md={2} lg={2}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "#ddd",
            p: 2,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Account Current Balance
          </Typography>

          {/* Row 1 - Amount */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <img
              src={cashIcon}
              alt="Amount Icon"
              style={{ width: 40, height: 40, marginRight: 8 }}
            />
            <Typography
              variant="body1"
              sx={{ width: "80px", flexShrink: 0 }} // Fixed width label
            >
              Amount:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                // fontWeight: "bold",
              }}
            >
              {accountBalance?.amountBalance ?? formData.amount ?? "0"} KD
            </Typography>
          </Box>

          {/* Row 2 - Gold */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={goldIcon}
              alt="Gold Icon"
              style={{ width: 40, height: 40, marginRight: 8 }}
            />
            <Typography
              variant="body1"
              sx={{ width: "80px", flexShrink: 0 }} // Fixed width label
            >
              Gold:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                // fontWeight: "bold",
              }}
            >
              {accountBalance?.goldBalance ?? formData.gold ?? "0"} GM
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default CustomerInputForm;
