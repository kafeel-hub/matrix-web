import React, { useState } from "react";
import { TextField, Button,Divider } from "@mui/material";
import CustomModal from "../Customcomponents/CustomModal";
import Grid from "@mui/material/Grid2";
import { CustomInput } from "../Customcomponents/CustomInputs";
import CustomSelect from "../Customcomponents/CustomInputs";

const ItemCatMasterForm = (props) => {
  const { modalOpen, setModalOpen, formData, onFormChange,handleSubmit,errors,itemType,isEdit } = props;
  const handleClose = () => setModalOpen(false);


  return (
    <div>
      <CustomModal
        open={modalOpen}
        onClose={handleClose}
        title={isEdit ? "Edit Item Category" : "Add Item Category"}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={2} sx={{ flexGrow: 1, py: 2 }}>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <CustomSelect
              label="Item Type"
              value={formData.ItmCodeType}
              onChange={(e) => onFormChange("ItmCodeType", e.target.value)}
              error={!!errors.ItmCodeType}
              helperText={errors.ItmCodeType}
            options={
              itemType&& itemType.map((item) => ({
                value: item.itemTypeId,
                label: `${item.name}`, 
              })) || []
            }
              
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
            <CustomInput
              label="Name (For label)"
              value={formData.ItmCodeShortName}
              onChange={(e) => onFormChange("ItmCodeShortName", e.target.value)}
              error={!!errors.ItmCodeShortName}
              helperText={errors.ItmCodeShortName}
            />
          </Grid>


          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
    
        </Grid>
      </CustomModal>
    </div>
  );
};

export default ItemCatMasterForm;