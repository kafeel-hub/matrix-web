import React, { useState, useEffect } from "react";
import * as _ from "lodash";
// import CustomDropdown from "../components/Customcomponents/CustomDropdown";
import { Box, Button, Typography, Paper } from "@mui/material";
import { connect } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { CustomSelect } from "../Customcomponents/CustomInputs";
import CustomButton from "../Customcomponents/CustomButton";
import MainHeading from "../Common/MainHeading";
import Grid from "@mui/material/Grid2";

function LoginStepTwoForm({
  userInfo,
  companiesRaw,
  tenantKey,
  preAuthToken,
  companylist,
  companyBranchlist,
  getCompanybranchlist,
  getCompanyDetails,
  loginLoading,
  companyBranchListLoading,
  CompanyDetailsLoading,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState({ fldID: "", fldDisplay: "" });
  const [companyLocation, setCompanyLocation] = useState({
    fldID: "",
    fldDisplay: "Select a branch",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (companylist && companylist.length > 0) {
      const newCompanies = companylist.map((item) => ({
        value: item.fldID,
        label: item.fldDisplay,
      }));
      setCompanies(newCompanies);
    } else {
      navigate("/");
    }
  }, [companylist, navigate]);

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setCompany({ fldID: companyId, fldDisplay: companyId });
    setCompanyLocation({ fldID: "", fldDisplay: "Select a branch" });
    const selected = companiesRaw.find((x) => String(x.companyId) === String(companyId));
    getCompanybranchlist({ locations: selected?.locations || [] });
    setErrors((prev) => ({ ...prev, company: "" }));
  };

  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setCompanyLocation({ fldID: locationId, fldDisplay: locationId });
    setErrors((prev) => ({ ...prev, branch: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!company.fldID) validationErrors.company = "Company is required.";
    if (!companyLocation.fldID) validationErrors.branch = "Branch is required.";

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
    } else {
      getCompanyDetails({
        tenantKey,
        preAuthToken,
        companyId: company.fldID,
        locationId: companyLocation.fldID,
        navigate,
      });
    }
  };

  return (
    <Paper
      className="custom-card_001"
      bgcolor={theme.palette.background.default}
      sx={{
        padding: theme.spacing(4),
        maxWidth: 400,
        width: "100%",
        textAlign: "center",
      }}
    >
      <MainHeading heading={"Select Company and Branch"} />
      {(companyBranchListLoading || CompanyDetailsLoading) && <Loader />}

      <form className="custom-form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12, lg: 12 }}>
            <CustomSelect
              label="Company"
              value={company.fldID}
              onChange={handleCompanyChange}
              options={companies}
              error={errors.company}
              helperText={errors.company}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 12 }}>
            <CustomSelect
              label="Branch"
              value={companyLocation.fldID}
              onChange={handleLocationChange}
              options={
                companyBranchlist?.map((item) => ({
                  value: item.fldID,
                  label: item.fldDisplay,
                })) || []
              }
              error={errors.branch}
              helperText={errors.branch}
            />
          </Grid>
          <CustomButton
            text="Proceed"
            theme={theme}
            fullWidth
            sx={{ mt: 2 }}
            variantType="dark"
            type="submit"
            className="custom-primary-button no-print"

            // disabled={loginLoading} loading={loginLoading}
          />
        </Grid>
      </form>
    </Paper>
  );
}

const mapStateToProps = ({ auth = {} }) => ({
  companylist: _.get(auth, "companyList", []),
  companiesRaw: _.get(auth, "companies", []),
  tenantKey: _.get(auth, "tenantKey", ""),
  preAuthToken: _.get(auth, "preAuthToken", ""),
  companyBranchlist: _.get(auth, "companyBranchList", []),
  userInfo: _.get(auth, "user", {}),
  loginLoading: auth.signInLoading || false,
  companyBranchListLoading: _.get(auth, "companyBranchListLoading", false),
  CompanyDetailsLoading: _.get(auth, "CompanyDetailsLoading", false),
});

const mapDispatchToProps = (dispatch) => ({
  getCompanybranchlist: (data) =>
    dispatch({ type: "getCompanyBranchlistcalled", payload: data }),
  getCompanyDetails: (data) =>
    dispatch({ type: "getCompanyDetailscalled", payload: data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginStepTwoForm);
