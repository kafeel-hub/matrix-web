import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { connect } from "react-redux";
import CommonSearch from "../../components/Customcomponents/CommonSearch";
import ReportCommonTable from "../../components/CustomTable/ReportCommonTable";
import CustomDropdown from "../../components/Customcomponents/CustomDropdown";
import EditIcon from "@mui/icons-material/Edit";
import ViewIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CustomTabs from "../../components/Customcomponents/CustomTabs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Grid from "@mui/material/Grid2";
import CustomButton from "../../components/Customcomponents/CustomButton";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import MainHeading from "../../components/Common/MainHeading";
import CustomDatePicker from "../../components/Customcomponents/CustomDatePicker";

import { DataGrid } from "@mui/x-data-grid";
const SalesInvoice = ({
  comboBox,
  invoiceData,
  companyBranchlist,
  CompanyDetails,
  getTableData,
  tableData,
  loading,
  authData,
}) => {
  const navigate = useNavigate();
  const [currentKey, setCurrentKey] = useState("GSAL");

  const { state } = useLocation();

  console.log("authData", authData, tableData);
  const TableData = [];

  // if (Array.isArray(tableData)) {
  //   tableData.forEach((item, index) => {
  //     TableData.push({
  //       ...item,
  //       id: index + 1,
  //     });
  //   });
  // }
  tableData = {
    January: [
      {
        TranNo: "INV001",
        TranType: "2025-01-12",
        TranPrtCivilId: "John Doe",
        TranPrtPhone: 150,
        ProdStoneWgt: 10,
        ProdGoldNetWgt: 120,
        ProdGoldPureWgt: 115,
        ProdMcTypeId: 500,
        ProdGoldWgt: 130,
      },
      {
        TranNo: "INV002",
        TranType: "2025-01-20",
        TranPrtCivilId: "Jane Smith",
        TranPrtPhone: 180,
        ProdStoneWgt: 8,
        ProdGoldNetWgt: 160,
        ProdGoldPureWgt: 155,
        ProdMcTypeId: 600,
        ProdGoldWgt: 165,
      },
      // more entries...
    ],
    February: [
      {
        TranNo: "INV003",
        TranType: "2025-02-05",
        TranPrtCivilId: "Mark Wayne",
        TranPrtPhone: 190,
        ProdStoneWgt: 6,
        ProdGoldNetWgt: 140,
        ProdGoldPureWgt: 135,
        ProdMcTypeId: 400,
        ProdGoldWgt: 145,
      },
      // ...
    ],
    // more months...
  };
  const flatRows = Object.entries(tableData).flatMap(([month, rows]) =>
    rows.map((row) => ({ ...row, month }))
  );
  const columns = [
    // { field: "id", headerName: "Sr. No.", width: 120, flex: 1 },

    {
      field: "TranNo",
      headerName: "Invoice No.",
      width: 100,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "TranType",
      headerName: "Date",

      width: 90,
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "TranPrtCivilId",
      headerName: "Customer Name",
      type: "number",
      width: 120,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
      // disableColumnMenu: false,
    },
    {
      field: "TranPrtPhone",
      headerName: "Gross Wt",
      type: "number",
      width: 120,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "ProdStoneWgt",
      headerName: "Stone Wt",
      sortable: false,
      filterable: true,
      width: 130,
      // disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "ProdGoldNetWgt",
      headerName: "Net Wt",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "ProdGoldPureWgt",
      headerName: "Pure Wt",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "ProdMcTypeId",
      headerName: "MC value",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "ProdGoldWgt",
      headerName: "Gold",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   type: "actions",
    //   width: 90,
    //   renderCell: (params) => {
    //     return (
    //       <div className="action-btn-container">
    //         <ViewIcon onClick={() => handleEdit(params)} />
    //         {/* <EditIcon color="success" />
    //         <DeleteIcon color="error" /> */}
    //       </div>
    //     );
    //   },
    //   disableColumnMenu: true,
    //   sortable: false,
    //   flex: 1,
    //   align: "center",
    //   headerAlign: "center",
    // },
  ];

  const theme = useTheme();
  function CustomToolbar() {
    return (
      <div style={{ padding: 8 }}>
        <GridToolbarExport />
      </div>
    );
  }
  const handleEdit = (data) => {
    navigate(`/invoice-details/${data.row.TranNo}`, {
      state: { type: data.row.TranType },
    });
  };

  function getTabIndexByKey(tabs, key) {
    return tabs.findIndex((tab) => tab.key === key);
  }

  useEffect(() => {
    if (state) {
      setCurrentKey(state.type);
      setTabValue(getTabIndexByKey(tabsData, state.type));
    }
  }, [state]);

  // useEffect(() => {
  //   if (authData) {
  //     getTableData({
  //       CompanyId: authData?.companyId,
  //       LocationId: authData?.companyId,
  //       YearNo: authData.companyDetails[0]?.FinancialYear || 2021,
  //       invoiceType: currentKey,
  //     });
  //   }
  // }, [currentKey]);

  // const [tabValue, setTabValue] = useState(0);

  // const handleTabChange = (event, newValue) => {
  //   setCurrentKey(tabsData[newValue].key);
  //   setTabValue(newValue);
  // };

  //   const tabsData = [
  //     // { label: "All", key: "" },
  //     { label: "GSAL", key: "GSAL", content: "Retail" },
  //     { label: "SCRAP", key: "SCRAP", content: "Scrap" },
  //     { label: "GRET", key: "GRET", content: "Return" },
  //     { label: "UGLP", key: "UGLP", content: "Unfixed Purchase" },
  //     { label: "GI", key: "GI", content: "Reciept Voucher" },
  //     { label: "GR", key: "GR", content: "Payment Voucher" },
  //     { label: "GFS", key: "GFS", content: "Sale Gold Fixing Voucher" },
  //     { label: "GFP", key: "GFP", content: "Purchase Gold Fixing Voucher" },
  //   ];
  const handleSelectChange = (value) => {
    console.log(value);
  };
  const onFormChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };
  return (
    <>
      <div className="main-section">
        {loading && <Loader />}
        <MainHeading heading=" Jeweller Shop" />

        <Divider sx={{ mt: 0 }} />
        {/* <MainHeading heading=" Invoice List" /> */}
        <Typography sx={{ textAlign: "left", m: 1 }} component={"h2"}>
          Sales Report
        </Typography>
        <Paper
          className="custom-card_001"
          bgcolor={theme.palette.background.default}
          sx={{
            maxWidth: "100%",
            width: "100%",
            textAlign: "center",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Grid className="" container spacing={3} sx={{ flexGrow: 1 }}>
              <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                <CustomDropdown
                  key={""}
                  label={"Search"}
                  value={"placeholder"}
                  onChange={(_, value) => handleSelectChange(value || "")}
                  // options={""}
                  //   callFilterAction={callFilterAction}
                  //   error={!!errors[""] || ""}
                  //   helperText={errors[""] || ""}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                <CustomDatePicker
                  label={"From"}
                  value={""}
                  onChange={(newValue) => onFormChange("date", newValue)}
                  errors={""}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                <CustomDatePicker
                  label={"To"}
                  value={""}
                  onChange={(newValue) => onFormChange("date", newValue)}
                  errors={""}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mt: 2 }} />
          {/* <CustomTabs
            tabs={tabsData}
            value={tabValue}
            onChange={handleTabChange}
            centered={true}
            styles={{ marginTop: "20px" }}
          /> */}
          {/* <Box sx={{ p: 2 }}>
            <Typography sx={{ textAlign: "left" }} component={"h3"}>
              {tabsData[tabValue]?.content} Invoice Data
            </Typography>
          </Box> */}

          <ReportCommonTable
            columns={columns}
            rows={TableData}
            handleEdit={handleEdit}
          />
        </Paper>
      </div>
    </>
  );
};
const mapStateToProps = ({ auth = {}, demo = {}, invoice = {} }) => ({
  comboBox: _.get(auth, "comboBox", []),
  invoiceData: _.get(invoice, "invoiceData", []),
  companyBranchlist: _.get(auth, "companyBranchList", []),
  CompanyDetails: _.get(auth, "CompanyDetails", []),
  tableData: _.get(invoice, "tableData", []),
  loading: _.get(invoice, "tableDataloading", false),
  authData: _.get(auth, "authData", {}),
});

const mapDispatchToProps = (dispatch) => ({
  getTableData: (data) =>
    dispatch({ type: "gettableDatacalled", payload: data }),
  //   saveInvoice: (data) => dispatch({ type: "saveInvoicecalled", payload: data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(SalesInvoice);
