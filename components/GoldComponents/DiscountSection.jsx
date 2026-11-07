import React from "react";
import { CustomInput } from "../Customcomponents/CustomInputs";
import Grid from "@mui/material/Grid2";

function DiscountSection(props) {
  const {
    totalAmount,
    discount,
    setDiscount,
    netAmount,
    remarks,
    setRemarks,
    goldWeight,
    pricePerGrm,
    fixingAmount,
    type,
  } = props;
  // return (
  //   <>
  //     {type !== "GI" && type !== "GR" && type !== "GFS" && type !== "GFP" && (
  //       <Grid container spacing={1} sx={{ flexGrow: 1, py: 1 }}>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Total Amount"
  //             value={totalAmount.toFixed(3)}
  //             disabled={true}
  //           />
  //         </Grid>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Discount"
  //             value={discount}
  //             onChange={(e) => setDiscount(e.target.value)}
  //             type="number"
  //             min={0}
  //           />
  //         </Grid>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Net Amount"
  //             value={netAmount.toFixed(3)}
  //             disabled={true}
  //           />
  //         </Grid>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Remarks"
  //             value={remarks}
  //             rows={3}
  //             onChange={(e) => setRemarks(e.target.value)}
  //           />
  //         </Grid>
  //       </Grid>
  //     )}
  //     {type == "GI" && (
  //       <Grid container spacing={2} sx={{ flexGrow: 1, py: 1 }}>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Gold Weight (999)"
  //             value={goldWeight}
  //             // disabled={true}
  //           />
  //         </Grid>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Price/Gms"
  //             value={pricePerGrm}
  //             //   onChange={}
  //             type="number"
  //             min={0}
  //           />
  //         </Grid>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Fixing Amount"
  //             value={fixingAmount}
  //             // disabled={true}
  //           />
  //         </Grid>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Remarks"
  //             value={remarks}
  //             rows={3}
  //             onChange={(e) => setRemarks(e.target.value)}
  //           />
  //         </Grid>
  //       </Grid>
  //     )}
  //     {(type == "GFS" || type == "GFP") && (
  //       <Grid container spacing={2} sx={{ flexGrow: 1, py: 1 }}>
  //         <Grid size={{ xs: 12, md: 12, lg: 12 }}>
  //           <CustomInput
  //             label="Remarks"
  //             value={remarks}
  //             rows={3}
  //             onChange={(e) => setRemarks(e.target.value)}
  //           />
  //         </Grid>
  //       </Grid>
  //     )}
  //   </>
  // );
  return (
    <>
      {type !== "GI" && type !== "GR" && type !== "GFS" && type !== "GFP" && (
        <Grid container spacing={1} sx={{ flexGrow: 1, py: 1 }}>
          {/* Row 1: Discount & Remarks */}
          <Grid item xs={3} sm={3} md={3} lg={3}>
            <CustomInput
              label="Discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              type="number"
              min={0}
              sx={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={3} sm={3} md={3} lg={3}>
            <CustomInput
              label="Remarks"
              value={remarks}
              rows={3}
              onChange={(e) => setRemarks(e.target.value)}
              sx={{ width: "100%" }}
            />
          </Grid>

          {/* Row 2: Total & Net Amount */}
          <Grid item xs={3} sm={3} md={3} lg={3}>
            <CustomInput
              label="Total Amount"
              value={totalAmount.toFixed(3)}
              disabled={true}
              sx={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={3} sm={3} md={3} lg={3}>
            <CustomInput
              label="Net Amount"
              value={netAmount.toFixed(3)}
              disabled={true}
              sx={{ width: "100%" }}
            />
          </Grid>
        </Grid>
      )}

      {type === "GI" && (
        <Grid spacing={1} sx={{ flexGrow: 1, py: 1 }}>
          {/* <Grid item xs={6} sm={6} md={3} lg={3}>
            <CustomInput label="Gold Weight (999)" value={goldWeight} />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <CustomInput
              label="Price/Gms"
              value={pricePerGrm}
              type="number"
              min={0}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3} lg={3}>
            <CustomInput label="Fixing Amount" value={fixingAmount} />
          </Grid> */}
          <Grid item xs={12} md={12} sm={12}>
            <CustomInput
              label="Remarks"
              value={remarks}
              rows={3}
              fullWidth
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Grid>
        </Grid>
      )}

      {/* {type === "GFP" && (
        <Grid container spacing={1} sx={{ flexGrow: 1, py: 1 }}>
          <Grid item xs={6} sm={6} md={3} lg={3}>
            <CustomInput
              label="Remarks"
              value={remarks}
              rows={3}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Grid>
        </Grid>
      )} */}
    </>
  );
}

export default DiscountSection;
