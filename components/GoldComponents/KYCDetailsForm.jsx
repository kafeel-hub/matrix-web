import React from "react";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import { CustomInput, CustomSelect } from "../Customcomponents/CustomInputs";

const KYCDetailsForm = ({ formData, errors, onFormChange }) => {
  const purchaseReasonOptions = [
    { value: "Investment", label: "Investment" },
    { value: "Saving", label: "Saving" },
    { value: "Gift", label: "Gift to Friend/Family" },
    { value: "Other", label: "Other" },
  ];

  const sourceFundOptions = [
    { value: "Salary", label: "Salary" },
    { value: "Business", label: "Business" },
    { value: "Savings", label: "Savings" },
    { value: "Other", label: "Other" },
  ];

  const politicalLinkOptions = [
    { value: "No", label: "No" },
    { value: "Yes", label: "Yes" },
  ];

  const relationOptions = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Brother", label: "Brother" },
    { value: "Sister", label: "Sister" },
    { value: "Spouse", label: "Spouse" },
    { value: "Other", label: "Other" },
  ];

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        KYC Details
      </Typography>

      <Grid container spacing={2}>
        {/* Left Side */}

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomSelect
            label="Purchase Reason"
            value={formData.purchaseReason}
            onChange={(e) => onFormChange("purchaseReason", e.target.value)}
            options={purchaseReasonOptions}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInput
            label="Beneficiary"
            value={formData.beneficiary}
            onChange={(e) => onFormChange("beneficiary", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomSelect
            label="Source of Fund"
            value={formData.sourceOfFund}
            onChange={(e) => onFormChange("sourceOfFund", e.target.value)}
            options={sourceFundOptions}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInput
            label="Beneficiary Civil ID"
            value={formData.beneficiaryCivilId}
            onChange={(e) => onFormChange("beneficiaryCivilId", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomSelect
            label="Political Link"
            value={formData.politicalLink}
            onChange={(e) => onFormChange("politicalLink", e.target.value)}
            options={politicalLinkOptions}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInput
            label="Beneficiary Nationality"
            value={formData.beneficiaryNationality}
            onChange={(e) =>
              onFormChange("beneficiaryNationality", e.target.value)
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInput
            label="Beneficiary Relation"
            value={formData.beneficiaryRelation}
            onChange={(e) =>
              onFormChange("beneficiaryRelation", e.target.value)
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomInput
            label="Reason of Absence"
            value={formData.reasonOfAbsence}
            onChange={(e) => onFormChange("reasonOfAbsence", e.target.value)}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default KYCDetailsForm;
