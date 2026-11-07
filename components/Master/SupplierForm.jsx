import React, { useState } from "react";
import { TextField, Button,Divider } from "@mui/material";
import CustomModal from "../Customcomponents/CustomModal";
import Grid from "@mui/material/Grid2";
import { CustomInput } from "../Customcomponents/CustomInputs";
import CustomSelect from "../Customcomponents/CustomInputs";
import CustomDatePicker from "../Customcomponents/CustomDatePicker";

const SupplierForm = (props) => {
  const { modalOpen, setModalOpen, formData, onFormChange,handleSubmit,errors,data,handleFetchCreditCustomerInfo,currentItem,setCurrentItem } = props;
  const handleClose = () => {
    setModalOpen(false);
    setCurrentItem("")
  }

  
  return (
    <div>
      <CustomModal
        open={modalOpen}
        onClose={handleClose}
        title={`${!currentItem ?"Add Supplier": "Update Supplier"}`}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={2} sx={{ flexGrow: 1, py: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <CustomSelect
              label="Group of Accounts"
              value={formData.clActNo}
              onChange={(e) => handleFetchCreditCustomerInfo(e.target.value)}
              options={
                data?.act?.map((item) => ({
                  value: item.fldID,
                  label: `${item.fldDisplay} ${item.fldID}`, 
                })) || []
              }

            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label={"Account No"}
              name="account-no"
              value={formData.clActNo}
              onChange={(e) => onFormChange("clActNo", e.target.value)}
              error={!!errors.clActNo}
              helperText={errors.clActNo}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
                     label={"Customer ID"}
                     name="customer-id"
                     value={formData.clCode}
                     // onChange={(e) => onFormChange("clCode", e.target.value)}
                     error={!!errors.clCode}
                     helperText={errors.clCode}
                     type="number"
       
                   />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Short Name/Prefix"
              value={formData.clShortName}
              onChange={(e) => onFormChange("clShortName", e.target.value)}
              error={!!errors.clShortName}
              helperText={errors.clShortName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <CustomInput
              label="Customer Name"
              name="customer_name"
              value={formData.clName}
              onChange={(e) => onFormChange("clName", e.target.value)}
              error={!!errors.clName}
              helperText={errors.clName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Contact No"
              value={formData.clPerson}
              onChange={(e) => onFormChange("clPerson", e.target.value)}
              error={!!errors.clPerson}
              helperText={errors.clPerson}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Job Title"
              value={formData.clCustDesig}
              onChange={(e) => onFormChange("clCustDesig", e.target.value)}
              error={!!errors.clCustDesig}
              helperText={errors.clCustDesig}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <CustomSelect
              label="Country"
              value={formData.clCountry}
              onChange={(e) => onFormChange("clCountry", e.target.value)}
              options={
                data?.country?.map((item) => ({
                  value: item.fldID,
                  label: item.fldDisplay,
                })) || []
              }
              error={!!errors.clCountry}
              helperText={errors.clCountry}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomSelect
              label="Area/Region"
              value={formData.clAreaId}
              onChange={(e) => onFormChange("clAreaId", e.target.value)}
              options={
                data?.area?.map((item) => ({
                  value: item.fldID,
                  label: item.fldDisplay,
                })) || []
              }
              error={!!errors.clAreaId}
              helperText={errors.clAreaId}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <CustomInput
              label="Address"
              row = {3}
              multiline={true}
              value={formData.clAdd1}
              onChange={(e) => onFormChange("clAdd1", e.target.value)}
              error={!!errors.clAdd1}
              helperText={errors.clAdd1}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Phone"
              value={formData.clPhone}
              onChange={(e) => onFormChange("clPhone", e.target.value)}
              error={!!errors.clPhone}
              helperText={errors.clPhone}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Fax"
              value={formData.clCompanyFax}
              onChange={(e) => onFormChange("clCompanyFax", e.target.value)}
              error={!!errors.clCompanyFax}
              helperText={errors.clCompanyFax}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Company CR No"
              value={formData.clCrNo}
              onChange={(e) => onFormChange("clCrNo", e.target.value)}
              error={!!errors.clCrNo}
              helperText={errors.clCrNo}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <CustomDatePicker
          label="CR Exp Date"
            value={formData.clCrExpDate}
            onChange={(newValue) => onFormChange("clCrExpDate", newValue)}
            errors={errors}
          />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Civil ID"
              value={formData.clCivilId}
              onChange={(e) => onFormChange("clCivilId", e.target.value)}
              error={!!errors.clCivilId}
              helperText={errors.clCivilId}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <CustomDatePicker
          label="Civil Id Exp Date"
            value={formData.clCivilIdExpDate}
            onChange={(newValue) => onFormChange("clCivilIdExpDate", newValue)}
            errors={errors}
          />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Credit Days"
              type="number"
              value={formData.clCreditDays}
              onChange={(e) => onFormChange("clCreditDays", e.target.value)}
              error={!!errors.clCreditDays}
              helperText={errors.clCreditDays}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Notes"
              value={formData.clNotes}
              onChange={(e) => onFormChange("clNotes", e.target.value)}
              error={!!errors.clNotes}
              helperText={errors.clNotes}
            />
          </Grid>
        </Grid>
      </CustomModal>
    </div>
  );
};

export default SupplierForm;