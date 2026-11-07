import React from "react";
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
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  CustomInput,
  CustomSelect,
  CustomSearchableDropdown,
} from "../Customcomponents/CustomInputs";
import CustomDatePicker from "../Customcomponents/CustomDatePicker";
import CustomDropdown from "../Customcomponents/CustomDropdown";

const CustomerDetailsForm = (props) => {
  const {
    data,
    formData,
    errors,
    onFormChange,
    type,
    invoice,
    currencyList,
    callFilterAction,
    onKeyDown,
    onBlur,
    invoiceType = 0,
    onInvoiceTypeChange,
    creditCustomerOptions = [],
    selectedCreditCustomer = null,
    onCreditCustomerChange,
    searchCreditCustomers,
    creditCustomerLoading = false,
  } = props;
  console.log(data, "supplier");
  const purityOptions = [
    {
      lbl: 999,
      val: 999,
    },
    {
      lbl: 999.5,
      val: 999.5,
    },
    {
      lbl: 995,
      val: 995,
    },
  ];
  const fieldName =
    (type == "UGLP" || type == "USAL") || type == "GI" || type == "GR"
      ? "contactPerson"
      : "customerName";
  console.log(formData.date, "child componenet");
  const { supplierOptionsWithLabel, supplierMap } = React.useMemo(() => {
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
    <>
      <Grid container spacing={1} sx={{ flexGrow: 1, p: 1 }}>
        {(type === "GSAL" || type === "returnInvoice") && (
          <>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography fontWeight={700}>Invoice Type</Typography>
                <RadioGroup
                  row
                  value={Number(invoiceType)}
                  onChange={(event) => onInvoiceTypeChange?.(Number(event.target.value))}
                >
                  <FormControlLabel value={0} control={<Radio size="small" />} label="CASH" />
                  <FormControlLabel value={1} control={<Radio size="small" />} label="CREDIT" />
                </RadioGroup>
              </Box>
            </Grid>
            {Number(invoiceType) === 1 && (
              <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
                <CustomDropdown
                  label="Credit Customer"
                  value={selectedCreditCustomer}
                  onChange={(event, newValue) => onCreditCustomerChange?.(newValue)}
                  options={creditCustomerOptions}
                  callFilterAction={searchCreditCustomers}
                  serverSideSearch={true}
                  loading={creditCustomerLoading}
                  placeholder="Search customer ID, name, Civil ID or phone"
                  error={!!errors.creditCustomer}
                  helperText={errors.creditCustomer}
                />
              </Grid>
            )}
          </>
        )}
        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <CustomSelect
            label="Location"
            value={formData.location}
            onChange={(e) => onFormChange("location", e.target.value)}
            options={
              data?.loc?.map((item) => ({
                value: item.fldID,
                label: item.fldDisplay,
              })) || []
            }
            error={!!errors.location}
            helperText={errors.location}
          />
        </Grid> */}
        {type !== "UGLP" &&
          type !== "USAL" &&
          type !== "GI" &&
          type !== "GR" &&
          type !== "GFS" &&
          type !== "GFP" && (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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
          )}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <CustomDatePicker
            value={formData.date}
            onChange={(newValue) => onFormChange("date", newValue)}
            errors={errors}
          />
        </Grid>
        {(type == "UGLP" || type == "USAL") && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              {/* Account Number dropdown shows both id + name in label */}
              <CustomDropdown
                key={data?.supplier}
                label={type == "USAL" ? " Select Customer" : " Select Supplier"}
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
                placeholder={type == "USAL" ? "Select Customer" : "Select Supplier"}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label={type == "USAL" ? "Customer Name" : "Supplier Name"}
                name="supplierName"
                value={formData.supplierName}
                onChange={(e) => onFormChange("supplierName", e.target.value)}
                error={!!errors.supplierName}
                helperText={errors.supplierName}
              />
              {/* If you want to force strict sync (prevent editing), add disabled prop:
                    <CustomInput ... disabled /> */}
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Credit Days"
                name="creditDays"
                value={formData.creditDays}
                onChange={(e) => onFormChange("creditDays", e.target.value)}
                error={!!errors.creditDays}
                helperText={errors.creditDays}
              />
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Supplier Invoice"
                name="supplierInvoice"
                value={formData.supplierInvoice}
                onChange={(e) =>
                  onFormChange("supplierInvoice", e.target.value)
                }
                error={!!errors.supplierInvoice}
                helperText={errors.supplierInvoice}
              />
            </Grid> */}
          </>
        )}
        {type == "returnInvoice" && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            {/* <CustomDropdown
              label="Against Invoice"
              value={formData.againstInvoice}
              onChange={(selectedValue) =>
                onFormChange("againstInvoice", selectedValue)
              }
              options={
                invoice?.map((item) => ({
                  value: item.TranNo,
                  label: item.TranNo,
                })) || []
              }
              error={!!errors.againstInvoice}
              helperText={errors.againstInvoice}
              searchable={true}
              callFilterAction={callFilterAction}
              placeholder="Select Invoice"
            /> */}
            <CustomInput
              label="Against Invoice"
              name="againstInvoice"
              value={formData.againstInvoice}
              onChange={(e) => onFormChange("againstInvoice", e.target.value)}
              onKeyDown={(e) => onKeyDown(e, "againstInvoice", e.target.value)}
              onBlur={(e) => onBlur("againstInvoice", e.target.value)}
              error={!!errors.againstInvoice}
              helperText={errors.againstInvoice}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <CustomInput
            label="Civil Id"
            name="civilId"
            value={formData.civilId}
            onChange={(e) => onFormChange("civilId", e.target.value)}
            onKeyDown={(e) => onKeyDown(e, "civilId", e.target.value)}
            onBlur={(e) => onBlur("civilId", e.target.value)}
            error={!!errors.civilId}
            helperText={errors.civil_id}
            disabled={(type === "GSAL" || type === "returnInvoice") && Number(invoiceType) === 1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <CustomInput
            label="Mobile"
            name="mobile"
            value={formData.mobile}
            onChange={(e) => onFormChange("mobile", e.target.value)}
            onKeyDown={(e) => onKeyDown(e, "mobile", e.target.value)}
            onBlur={(e) => onBlur("mobile", e.target.value)}
            error={!!errors.mobile}
            helperText={errors.mobile}
            disabled={(type === "GSAL" || type === "returnInvoice") && Number(invoiceType) === 1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <CustomInput
            label={
              (type == "UGLP" || type == "USAL") || type == "GI" || type == "GR"
                ? "Contact Person"
                : "Customer Name"
            }
            name={
              (type == "UGLP" || type == "USAL") || type == "GI" || type == "GR"
                ? "contactPerson"
                : "customerName"
            }
            value={
              (type == "UGLP" || type == "USAL") || type == "GI" || type == "GR"
                ? formData.contactPerson
                : formData.customerName
            }
            onChange={(e) => onFormChange(fieldName, e.target.value)}
            error={
              (type == "UGLP" || type == "USAL") || type == "GI" || type == "GR"
                ? !!errors.contactPerson
                : !!errors.customerName
            }
            helperText={
              (type == "UGLP" || type == "USAL") || type == "GI" || type == "GR"
                ? errors.contactPerson
                : errors.customerName
            }
            disabled={(type === "GSAL" || type === "returnInvoice") && Number(invoiceType) === 1}
          />
        </Grid>
        {type !== "GFS" && type !== "GFP" && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <CustomInput
              label="Customer Phone"
              name="customerPhone"
              type="number"
              value={formData.customerPhone}
              onChange={(e) => onFormChange("customerPhone", e.target.value)}
              onKeyDown={(e) => onKeyDown(e, "customerPhone", e.target.value)}
              onBlur={(e) => onBlur("customerPhone", e.target.value)}
              error={!!errors.customerPhone}
              helperText={errors.customerPhone}
              disabled={(type === "GSAL" || type === "returnInvoice") && Number(invoiceType) === 1}
            />
          </Grid>
        )}

        {type !== "GI" && type !== "GR" && type !== "GFS" && type !== "GFP" && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <CustomSelect
              label="Nationality"
              value={formData.nationality}
              onChange={(e) => onFormChange("nationality", e.target.value)}
              options={
                data?.country?.map((item) => ({
                  value: item.fldID,
                  label: item.fldDisplay,
                })) || []
              }
              error={!!errors.nationality}
              helperText={errors.nationality}
            />
          </Grid>
        )}
        {type !== "UGLP" &&
          type !== "USAL" &&
          type !== "GI" &&
          type !== "GR" &&
          type !== "GFS" &&
          type !== "GFP" && (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomSelect
                label="Area"
                value={formData.area}
                onChange={(e) => onFormChange("area", e.target.value)}
                options={
                  data?.area?.map((item) => ({
                    value: item.fldID,
                    label: item.fldDisplay,
                  })) || []
                }
                error={!!errors.area}
                helperText={errors.area}
              />
            </Grid>
          )}
        {type == "scrapPurchase" && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Block"
                name="bock"
                value={formData.block}
                onChange={(e) => onFormChange("block", e.target.value)}
                error={!!errors.block}
                helperText={errors.block}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Jedda"
                name="jedda"
                value={formData.jedda}
                onChange={(e) => onFormChange("jedda", e.target.value)}
                error={!!errors.jedda}
                helperText={errors.jedda}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Street"
                name="street"
                value={formData.street}
                onChange={(e) => onFormChange("street", e.target.value)}
                error={!!errors.street}
                helperText={errors.street}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Building"
                name="building"
                value={formData.building}
                onChange={(e) => onFormChange("building", e.target.value)}
                error={!!errors.building}
                helperText={errors.building}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Floor"
                name="floor"
                value={formData.floor}
                onChange={(e) => onFormChange("floor", e.target.value)}
                error={!!errors.floor}
                helperText={errors.floor}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Flat"
                name="flat"
                value={formData.flat}
                onChange={(e) => onFormChange("flat", e.target.value)}
                error={!!errors.flat}
                helperText={errors.flat}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="PACI NO."
                name="paciNo"
                value={formData.paciNo}
                onChange={(e) => onFormChange("paciNo", e.target.value)}
                error={!!errors.paciNo}
                helperText={errors.paciNo}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Gold Rate (24k)"
                name="goldRate"
                value={formData.goldRate}
                onChange={(e) => onFormChange("goldRate", e.target.value)}
                error={!!errors.goldRate}
                helperText={errors.goldRate}
              />
            </Grid>
          </>
        )}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <CustomInput
            label="Ref No"
            name="refNo"
            value={formData.refNo}
            onChange={(e) => onFormChange("refNo", e.target.value)}
            error={!!errors.refNo}
            helperText={errors.refNo}
          />
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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

        {(type == "GI" || type == "GR") && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label=" Supplier Ref No"
                name="supplierRef"
                value={formData.supplierRef}
                onChange={(e) => onFormChange("supplierRef", e.target.value)}
                error={!!errors.supplierRef}
                helperText={errors.supplierRef}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomDropdown
                label=" Party"
                name="party"
                value={formData.party}
                onChange={(e) => onFormChange("party", e.target.value)}
                error={!!errors.party}
                helperText={errors.party}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label=" Party Name"
                name="partyName"
                value={formData.partyName}
                onChange={(e) => onFormChange("partyName", e.target.value)}
                error={!!errors.partyName}
                helperText={errors.partyName}
              />
            </Grid>
          </>
        )}
        {type == "GSAL" && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Email"
                name="email"
                value={formData.email}
                onChange={(e) => onFormChange("email", e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Passport No"
                name="passportNo"
                value={formData.passportNo}
                onChange={(e) => onFormChange("passportNo", e.target.value)}
                error={!!errors.passportNo}
                helperText={errors.passportNo}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Profession"
                name="profession"
                value={formData.profession}
                onChange={(e) => onFormChange("profession", e.target.value)}
                error={!!errors.profession}
                helperText={errors.profession}
              />
            </Grid>
          </>
        )}
        {(type == "GI" || type == "UGLP" || type == "USAL" || type == "GR") && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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

        {/* </Grid> */}
        {/* </Grid> */}

        {/* <Grid container spacing={2} sx={{ flexGrow: 1, p: 1 }}> */}

        {(type == "GFS" || type == "GFP") && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Voucher No"
                name="voucherNo"
                value={formData.voucherNo}
                onChange={(e) => onFormChange("voucherNo", e.target.value)}
                error={!!errors.voucherNo}
                helperText={errors.voucherNo}
                disabled={true}
              />
            </Grid>
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
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Ex Rate"
                name="exRate"
                value={formData.exRate}
                onChange={(e) => onFormChange("exRate", e.target.value)}
                error={!!errors.exRate}
                helperText={errors.exRate}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Price/Grm"
                name="pricePerGrm"
                value={formData.pricePerGrm}
                onChange={(e) => onFormChange("pricePerGrm", e.target.value)}
                error={!!errors.pricePerGrm}
                helperText={errors.pricePerGrm}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Gold Weight"
                name="goldWeight"
                value={formData.goldWeight}
                onChange={(e) => onFormChange("goldWeight", e.target.value)}
                error={!!errors.goldWeight}
                helperText={errors.goldWeight}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomSelect
                label="Gold Purity"
                value={formData.pureGoldPurity}
                onChange={(e) => onFormChange("pureGoldPurity", e.target.value)}
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
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Fixing Amount"
                name="jedda"
                value={formData.fixingAmount}
                onChange={(e) => onFormChange("fixingAmount", e.target.value)}
                error={!!errors.fixingAmount}
                helperText={errors.fixingAmount}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label="Making Amount"
                name="makingAmount"
                value={formData.makingAmount}
                onChange={(e) => onFormChange("makingAmount", e.target.value)}
                error={!!errors.makingAmount}
                helperText={errors.makingAmount}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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
      {(type == "GI" || type == "GR" || type == "GFS" || type == "GFP") && (
        <>
          <Typography sx={{ display: "flex" }}>
            Account Current Balance
          </Typography>
          <Grid container spacing={1} sx={{ flexGrow: 1, p: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label=" Amount"
                name="amount"
                value={formData.amount}
                onChange={(e) => onFormChange("amount", e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount}
                disabled={true}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <CustomInput
                label=" Gold"
                name="gold"
                value={formData.gold}
                onChange={(e) => onFormChange("gold", e.target.value)}
                error={!!errors.gold}
                helperText={errors.gold}
                disabled={true}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default CustomerDetailsForm;

// {
//   "strClsInventory": {
//       "TranFinYear": "2021",
//       "TranLocId": 1,
//       "TranCompanyId": "1",
//       "TranType": "GSAL",
//       "TranNo": 0,
//       "TranDate": "2024-12-22T05:38:01.840Z",
//       "TranPrtName": "asa",
//       "TranPrtCountry": "CHINA",
//       "TranPrtPhone": "as",
//       "TranPrtMobile": "3wq43",
//       "TranPrtCivilId": "34123",
//       "TranPrtArea": "FAHAHEEL",
//       "TranInvType": "1",
//       "TranRef": "0.000",
//       "TranSManId": "12",
//       "TranGoldRate": "200",
//       "TranTotalAmt": "4083.400",
//       "TranDiscAmt": "0.000",
//       "TranNetAmt": "4083.400",
//       "TranScrapAmt": "0.000",
//       "TranRemark1": "",
//       "TranSysUser": "001"
//   },
//   "strTransactionTable": [
//       {
//           "ProdSrNo": 1,
//           "ProdTranTypeId": "0",
//           "ProdId": "GMG0003",
//           "ProdNameInv": "Melted Gold 855",
//           "ProdMcCost": "0.000",
//           "ProdGoldPurity": 855,
//           "ProdQty": "1",
//           "ProdMcTypeId": "0.000",
//           "ProdGoldWgt": 214.17,
//           "ProdStoneWgt": "10",
//           "ProdGoldNetWgt": "204.170",
//           "ProdStoneAmount": "0.000",
//           "ProdGoldRate": "20",
//           "ProdMcRate": "0.000",
//           "ProdRate": 19.066162394359623,
//           "ProdAmount": "4083.400"
//       }
//   ],
//   "strPaymentTable": [
//       {
//           "PaySrNo": 1,
//           "PayId": "CASH",
//           "PayAmt": "4083.400",
//           "PayCurId": "001",
//           "PayCurExRate": "1",
//           "PayCurAmt": "1",
//           "PayChqNo": "123",
//           "PayActNo": "123",
//           "PayChqDate": ""
//       }
//   ]
// }
