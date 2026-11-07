import React from "react";
import CustomButton from "../Customcomponents/CustomButton";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
function FooterButtonsGroup(props) {
  const theme = useTheme();

  const {
    type,
    handleSave,
    setFormData,
    isSaving = false,
    isEdit = false,
    setRows,
    setRemainingAmount,
    setDataReady,
    setRemarks,
    setDiscount,
    setPaymentRows,
    setErrors,
    rows,
    discount,
    paymentRows,
    remarks,
    remainingAmount,
    handleList,
    handleDelete,
  } = props;

  const resetRowsData = () => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        amount: "",
        description: "",
        goldPrice: "",
        grossWt: "",
        id: "",
        itemCode: {},
        mcPerGm: "",
        netWt: "",
        price: "",
        pureWeight: "",
        pureWt: "",
        purity: "",
        qty: "",
        stoneAmount: "",
        stoneWt: "",
        unitPricePerGm: "",
        deductionPrcnt: "",
        deductionWt: "",
      }))
    );
  };

  const resetData = () => {
    resetRowsData();

    setPaymentRows([]);

    setErrors({});
    handleDelete(null);
    setDiscount(0);
    setRemarks("");

    setRemainingAmount(0);

    setDataReady(false);
  };

  const resetCustomerData = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
    });
  };

  const resetHeaderData = () => {
    setFormData({
      location: "",
      invoiceNo: "",
      date: null,
      refNo: "",
      // salesman: "",
      supplier: "",
      civilId: "",
      mobile: "",
      customerPhone: "",
      phone: "",
      supplierInvoice: "",
      contactPerson: "",
      companyCRNO: "",
      creditDays: "",
      // customerName: "",
      supplierName: "",

      nationality: "",
      customerName: "",
      area: "",
      block: "",
      jedda: "",
      street: "",
      building: "",
      floor: "",
      flat: "",
      paciNo: "",
      goldRate: "",
      party: "",
      partyName: "",
      personPhone: "",
      amount: "",
      gold: "",
      supplierRef: "",
      againstInvoice: "",
    });
  };

  const handleClear = (type) => {
    resetHeaderData();
    resetData();
  };
  return (
    <Grid
      className="invoice-table-payment-section-main"
      container
      spacing={1}
      sx={{ flexGrow: 1, p: 1, mt: 0, py: 2 }}
    >
      <Grid size={{ xs: 4, md: 2, lg: 2 }}>
        <CustomButton
          text={isEdit ? "Update" : "Save"}
          variant="contained"
          theme={theme}
          fullWidth
          sx={{ mt: 2 }}
          variantType="dark"
          onClick={handleSave}
          BtnIcon={SaveIcon}
          // // disabled={loginLoading}
          loading={isSaving}
        />
      </Grid>
      <Grid size={{ xs: 4, md: 2, lg: 2 }}>
        <CustomButton
          text="Print"
          variant="outlined"
          // theme={theme}
          fullWidth
          sx={{ mt: 2 }}
          variantType="light"
          // type="submit"
          // onClick={handleSave}
          // disabled={loginLoading}
          // loading={loginLoading}
        />
      </Grid>
      <Grid size={{ xs: 4, md: 2, lg: 2 }}>
        <CustomButton
          text="List"
          // theme={theme}
          fullWidth
          sx={{ mt: 2 }}
          variantType="dark"
          onClick={handleList}
          // disabled={loginLoading}
          // loading={loginLoading}
        />
      </Grid>
      <Grid size={{ xs: 4, md: 2, lg: 1 }}>
        <CustomButton
          text="Clear"
          // theme={theme}
          fullWidth
          sx={{ mt: 2 }}
          variantType="dark"
          // type="submit"
          onClick={() => handleClear(type)}
          // disabled={loginLoading}
          // loading={loginLoading}
        />
      </Grid>
      {/* <Grid size={{ xs: 4, md: 2, lg: 1 }}>
        <CustomButton
          text="Cancel"
          // theme={theme}
          fullWidth
          sx={{ mt: 2 }}
          variantType="dark"
          // type="submit"
          // onClick={handleSave}
          // disabled={loginLoading}
          // loading={loginLoading}
        />
      </Grid> */}
      {/* <Grid size={{ xs: 4, md: 2, lg: 1 }} >
        <CustomButton
          text="Exit"
          // theme={theme}
          fullWidth
          sx={{ mt: 2 }}
          variantType="dark"
          // type="submit"
          onClick={handleSave}
          // disabled={loginLoading}
          // loading={loginLoading}
        />
      </Grid> */}
    </Grid>
  );
}

export default FooterButtonsGroup;
