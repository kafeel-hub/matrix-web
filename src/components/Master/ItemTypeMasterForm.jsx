import React, { useState } from "react";
import { TextField, Button,Divider } from "@mui/material";
import CustomModal from "../Customcomponents/CustomModal";
import Grid from "@mui/material/Grid2";
import { CustomInput } from "../Customcomponents/CustomInputs";
import CustomSelect from "../Customcomponents/CustomInputs";
import CustomDatePicker from "../Customcomponents/CustomDatePicker";

const ItemTypeMasterForm = (props) => {
  const { modalOpen, setModalOpen, formData, onFormChange,handleSubmit,errors,isEdit } = props;
  const handleClose = () => setModalOpen(false);

  
  return (
    <div>
      <CustomModal
        open={modalOpen}
        onClose={handleClose}
        title={isEdit ? "Edit Item Type" : "Add Item Type"}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={2} sx={{ flexGrow: 1, py: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <CustomInput
              label={"Code"}
              name="ItmCodeId"
              value={formData.ItmCodeId}
              disabled={isEdit}
              onChange={(e) => onFormChange("ItmCodeId", e.target.value)}
              error={!!errors.ItmCodeId}
              helperText={errors.ItmCodeId}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <CustomSelect
              label="Stock Item"
              value={formData.ItmCodeStockFlag}
              onChange={(e) => onFormChange("ItmCodeStockFlag", e.target.value)}
            //   error={!!errors.ItmCodeStockFlag}
            //   helperText={errors.ItmCodeStockFlag}
              options={[{value:0, label:"Yes"},{value:1, label:"No"}]
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <CustomSelect
              label="Status"
              value={formData.ItmCodeStatus}
              onChange={(e) => onFormChange("ItmCodeStatus", e.target.value)}
            //   error={!!errors.ItmCodeStatus}
            //   helperText={errors.ItmCodeStatus}
              options={[{value:0, label:"Active"},{value:1, label:"De-Active"}]
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <CustomInput
              label="Description"
              name="ItmCodeName"
              value={formData.ItmCodeName}
              onChange={(e) => onFormChange("ItmCodeName", e.target.value)}
              error={!!errors.ItmCodeName}
              helperText={errors.ItmCodeName}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <CustomInput
              label="Description (Arabic)"
              row = {3}
              multiline={true}
              value={formData.ItmCodeNameArb}
              onChange={(e) => onFormChange("ItmCodeNameArb", e.target.value)}
              error={!!errors.ItmCodeNameArb}
              helperText={errors.ItmCodeNameArb}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Prefix"
              value={formData.ItmCodePrefix}
              onChange={(e) => onFormChange("ItmCodePrefix", e.target.value)}
              error={!!errors.ItmCodePrefix}
              helperText={errors.ItmCodePrefix}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <CustomSelect
              label="Default (Yes/No)"
              value={formData.ItmTypeDefault}
              onChange={(e) => onFormChange("ItmTypeDefault", e.target.value)}
            //   error={!!errors.ItmTypeDefault}
            //   helperText={errors.ItmTypeDefault}
              options={[{value:0, label:"No"},{value:1, label:"Yes"}]
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomInput
              label="Pure Purity"
              value={formData.ItmGoldPurityNo}
              onChange={(e) => onFormChange("ItmGoldPurityNo", e.target.value)}
              error={!!errors.ItmGoldPurityNo}
              helperText={errors.ItmGoldPurityNo}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <CustomSelect
              label="Item Type Nature"
              value={formData.ItmTypeNature}
              onChange={(e) => onFormChange("ItmTypeNature", e.target.value)}
              options={[{value:0, label:"Weight and Pcs"},{value:1, label:"Only Pcs"}]}
            />
          </Grid>
        </Grid>
      </CustomModal>
    </div>
  );
};

export default ItemTypeMasterForm;