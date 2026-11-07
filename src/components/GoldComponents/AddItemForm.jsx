import React from "react";
import { Skeleton } from "@mui/material";
import CustomModal from "../Customcomponents/CustomModal";
import { CustomInput } from "../Customcomponents/CustomInputs";
import CustomDropdown from "../Customcomponents/CustomDropdown";
import Grid from "@mui/material/Grid2";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
} from "@mui/material";

function AddItemForm({
  modalOpen,
  setModalOpen,
  formData,
  setFormData,
  onFormChange,
  errors,
  options,
  fetchProductDetails,
  fields,
  handleSubmit,
  resetState,
  loading = false,
  setErrors,
  currentItemEdit,
  callFilterAction,
  serverSideSearch = false,
  isItembarCodeValid,
}) {
  const handleClose = () => {
    setModalOpen(false);
    resetState();
  };

  const handleSelectChange = (value) => {
    if (!value) {
      setFormData({});
      setErrors((prev) => ({}));
    } else {
      fetchProductDetails(value?.value);
      setFormData({ ...formData, itemCode: value });
      setErrors((prev) => ({ ...prev, itemCode: "" }));
    }
  };

  const renderField = (field) => {
    const dependentFields = ["qty", "grossWt", "stoneWt"];
    const isStoneAmountDisabled =
      field.key === "stoneAmount" && parseFloat(formData.stoneWt) === 0;

    const shouldDisable =
      field.disabled ||
      (isItembarCodeValid && dependentFields.includes(field.key)) ||
      isStoneAmountDisabled;

    if (field.inputType === "dropdown") {
      return (
        <CustomDropdown
          key={field.key}
          label={field.label}
          value={formData[field.key] ?? ""}
          onChange={(_, value) => handleSelectChange(value || "")}
          options={options}
          callFilterAction={callFilterAction}
          serverSideSearch={serverSideSearch}
          error={!!errors[field.key] || ""}
          helperText={errors[field.key] || ""}
        />
      );
    }
    if (field.inputType === "radio") {
      return (
        <Grid
          item
          xs={12}
          md={field.md}
          lg={field.lg}
          key={field.key}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FormControl component="fieldset" sx={{ m: 0 }}>
            <FormLabel
              component="legend"
              sx={{ mb: 0.1, mr: 1, fontSize: "0.9rem" }}
            >
              {field.label}
            </FormLabel>
            <RadioGroup
              row
              name={field.key}
              value={formData[field.key] || field.defaultValue}
              // onChange={(e) =>
              //   setFormData({ ...formData, [field.key]: e.target.value })
              // }
              onChange={(e) => {
                const syntheticEvent = {
                  target: {
                    name: field.key,
                    value: e.target.value,
                  },
                };

                onFormChange(syntheticEvent);
              }}
            >
              {field.options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>
      );
    }

    return (
      <>
        <CustomInput
          key={field.key}
          label={field.label}
          name={field.key}
          type={field.inputType || "text"}
          value={formData[field.key] ?? ""}
          onChange={onFormChange}
          disabled={shouldDisable}
          min={field.min}
          error={!!errors[field.key] || ""}
          helperText={errors[field.key] || ""}
        />
      </>
    );
  };

  return (
    <CustomModal
      submitButtonText={`${currentItemEdit !== null ? "Update" : "Add"}`}
      open={modalOpen}
      onClose={handleClose}
      title={`${currentItemEdit !== null ? "Update Item" : "Add Item"}`}
      onSubmit={handleSubmit}
    >
      {loading ? (
        <ItemDetailsFormSkeleton fields={fields} />
      ) : (
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          {fields.map((field) => (
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

const ItemDetailsFormSkeleton = ({ fields }) => {
  return (
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid
          size={{ xs: 12, md: field.md || 6, lg: field.lg || 6 }}
          key={field.key}
        >
          {/* <Skeleton variant="text" width="60%" height={30} /> */}
          <Skeleton variant="rectangular" width="100%" height={45} />
        </Grid>
      ))}
    </Grid>
  );
};
