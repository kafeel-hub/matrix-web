import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { connect, useDispatch, useSelector } from "react-redux";
import CommonSearch from "../components/Customcomponents/CommonSearch";
import CommonTable from "../components/CustomTable/CommonTable";
import EditIcon from "@mui/icons-material/Edit";
import ViewIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CustomTabs from "../components/Customcomponents/CustomTabs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Loader from "../components/Loader/Loader";
import MainHeading from "../components/Common/MainHeading";
import CustomDatePicker from "../components/Customcomponents/CustomDatePicker";
import { listSalesInvoices } from "../services/salesInvoiceApi";
import { listScrapPurchases } from "../services/scrapPurchaseApi";
import { listSalesReturns } from "../services/salesReturnApi";
import { listReceiptVouchers } from "../services/receiptVoucherApi";
import { listPaymentVouchers } from "../services/paymentVoucherApi";
import { listGoldReceiptVouchers } from "../services/goldReceiptVoucherApi";
import { listGoldPaymentVouchers } from "../services/goldPaymentVoucherApi";
import { listSalesGoldFixingVouchers } from "../services/salesGoldFixingVoucherApi";
import { listPurchaseGoldFixingVouchers } from "../services/purchaseGoldFixingVoucherApi";
import { listUnfixedPurchases } from "../services/unfixedPurchaseApi";
import { listUnfixedSales } from "../services/unfixedSalesApi";
import { listPettyCashExpenses } from "../services/pettyCashExpenseApi";
import { sessionRefreshed } from "../features/auth/authSlice";
const GoldData = ({
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
  const dispatch = useDispatch();
  const matrixAuth = useSelector((state) => state.auth || {});
  const [salesRows, setSalesRows] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [scrapRows, setScrapRows] = useState([]);
  const [scrapLoading, setScrapLoading] = useState(false);
  const [returnRows, setReturnRows] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);
  const [rvRows, setRvRows] = useState([]);
  const [rvLoading, setRvLoading] = useState(false);
  const [pvRows, setPvRows] = useState([]);
  const [pvLoading, setPvLoading] = useState(false);
  const [pcvRows, setPcvRows] = useState([]);
  const [pcvLoading, setPcvLoading] = useState(false);
  const [giRows, setGiRows] = useState([]);
  const [giLoading, setGiLoading] = useState(false);
  const [gpRows, setGpRows] = useState([]);
  const [gpLoading, setGpLoading] = useState(false);
  const [gfsRows, setGfsRows] = useState([]);
  const [gfsLoading, setGfsLoading] = useState(false);
  const [gfpRows, setGfpRows] = useState([]);
  const [gfpLoading, setGfpLoading] = useState(false);
  const [uglpRows, setUglpRows] = useState([]);
  const [uglpLoading, setUglpLoading] = useState(false);
  const [usalRows, setUsalRows] = useState([]);
  const [usalLoading, setUsalLoading] = useState(false);
  const [currentKey, setCurrentKey] = useState("GSAL");
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    date: "",
  });

  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  ); // initially empty

  const handleDateChange = (date) => {
    const formatted = date ? date.format("YYYY-MM-DD") : "";
    setSelectedDate(formatted);
  };
  const { state } = useLocation();

  console.log("authData", authData, tableData);
  const TableData = [];

  const effectiveTableData = currentKey === "GSAL" ? salesRows : currentKey === "SCRAP" ? scrapRows : currentKey === "GRET" ? returnRows : currentKey === "RV" ? rvRows : currentKey === "PV" ? pvRows : currentKey === "PCV" ? pcvRows : currentKey === "GR" ? giRows : currentKey === "GI" ? gpRows : currentKey === "GFS" ? gfsRows : currentKey === "GFP" ? gfpRows : currentKey === "UGLP" ? uglpRows : currentKey === "USAL" ? usalRows : [];
  if (Array.isArray(effectiveTableData)) {
    effectiveTableData.forEach((item, index) => {
      TableData.push({
        ...item,
        id: index + 1,
      });
    });
  }
  const columns = [
    // { field: "id", headerName: "Sr. No.", width: 120, flex: 1 },

    {
      field: "transactionNo",
      headerName: "Transaction Id",
      width: 100,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "transactionType",
      headerName: "Type",

      width: 90,
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "customerCivilId",
      headerName: "Civil Id",
      type: "number",
      width: 120,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
      // disableColumnMenu: false,
    },
    {
      field: "customerPhone",
      headerName: "Phone",
      type: "number",
      width: 120,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "customerName",
      headerName: "Name",
      sortable: false,
      filterable: true,
      width: 130,
      // disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "netAmount",
      headerName: "Transaction Amount",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "invoiceDate",
      headerName: "Date",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 90,
      renderCell: (params) => {
        return (
          <div className="action-btn-container">
            <ViewIcon onClick={() => handleEdit(params)} />
            {/* <EditIcon color="success" />
            <DeleteIcon color="error" /> */}
          </div>
        );
      },
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
  ];

  const theme = useTheme();

  const handleEdit = (data) => {
    if (currentKey === "PCV") { navigate(`/prettycashexpenses/${data.row.transactionNo || data.row.voucherNo}`); return; }
    if (currentKey === "GR") { navigate(`/gold-receipt-voucher/${data.row.transactionNo}`); return; }
    if (currentKey === "GI") { navigate(`/goldpayment-voucher/${data.row.transactionNo}`); return; }
    if (currentKey === "GFS") { navigate(`/salegoldfixing-voucher/${data.row.transactionNo}`); return; }
    if (currentKey === "GFP") { navigate(`/purchasegoldfixing-voucher/${data.row.transactionNo}`); return; }
    if (currentKey === "UGLP") { navigate(`/gold-unfixed-purchase/${data.row.transactionNo}`); return; }
    if (currentKey === "USAL") { navigate(`/gold-unfixed-sales/${data.row.transactionNo}`); return; }
    if (String(data.row.transactionType).toUpperCase() === "RV") {
      navigate(`/reciept-voucher/${data.row.transactionNo}`);
      return;
    }
    if (String(data.row.transactionType).toUpperCase() === "PV") {
      navigate(`/payment-voucher/${data.row.transactionNo}`);
      return;
    }
    navigate(`/invoice-details/${data.row.transactionNo}`, { state: { type: data.row.transactionType } });
  };

  function getTabIndexByKey(tabs, key) {
    return tabs.findIndex((tab) => tab.key === key);
  }

  useEffect(() => {
    if (state?.type) {
      // Older Return screens used RET while the persisted/API transaction type is GRET.
      // Normalize here so either navigation value always activates the GRET API list.
      const requestedType = String(state.type).toUpperCase() === "RET" ? "GRET" : String(state.type).toUpperCase();
      const index = getTabIndexByKey(tabsData, requestedType);
      if (index >= 0) {
        setCurrentKey(requestedType);
        setTabValue(index);
      }
    }
  }, [state]);

  useEffect(() => {
    if (currentKey !== "GSAL" || !matrixAuth.accessToken || !selectedDate) {
      setSalesRows([]);
      return;
    }
    const controller = new AbortController();
    setSalesLoading(true);
    listSalesInvoices({
      date: selectedDate,
      session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey },
      signal: controller.signal,
      onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)),
    })
      .then(setSalesRows)
      .catch((error) => { if (error?.name !== "AbortError") console.error("Sales invoice list failed", error); })
      .finally(() => setSalesLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "SCRAP" || !matrixAuth.accessToken || !selectedDate) {
      setScrapRows([]);
      return;
    }
    const controller = new AbortController();
    setScrapLoading(true);
    listScrapPurchases({
      date: selectedDate,
      session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey },
      signal: controller.signal,
      onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)),
    })
      .then(setScrapRows)
      .catch((error) => { if (error?.name !== "AbortError") console.error("Scrap purchase list failed", error); })
      .finally(() => setScrapLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);


  useEffect(() => {
    if (!["GRET", "RET"].includes(currentKey) || !matrixAuth.accessToken || !selectedDate) { setReturnRows([]); return; }
    const controller = new AbortController();
    setReturnLoading(true);
    listSalesReturns({
      date: selectedDate,
      session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey },
      signal: controller.signal,
      onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)),
    })
      .then(setReturnRows)
      .catch((error) => { if (error?.name !== "AbortError") console.error("Sales return list failed", error); })
      .finally(() => setReturnLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "RV" || !matrixAuth.accessToken || !selectedDate) { setRvRows([]); return; }
    const controller = new AbortController();
    setRvLoading(true);
    listReceiptVouchers({ date: selectedDate, session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey }, signal: controller.signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) })
      .then(setRvRows)
      .catch((error) => { if (error?.name !== "AbortError") console.error("Receipt voucher list failed", error); })
      .finally(() => setRvLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "PV" || !matrixAuth.accessToken || !selectedDate) { setPvRows([]); return; }
    const controller = new AbortController();
    setPvLoading(true);
    listPaymentVouchers({ date: selectedDate, session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey }, signal: controller.signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) })
      .then(setPvRows)
      .catch((error) => { if (error?.name !== "AbortError") console.error("Payment voucher list failed", error); })
      .finally(() => setPvLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "PCV" || !matrixAuth.accessToken || !selectedDate) { setPcvRows([]); return; }
    const controller = new AbortController();
    setPcvLoading(true);
    listPettyCashExpenses({ date: selectedDate, session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey }, signal: controller.signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) })
      .then((rows) => setPcvRows((rows || []).map((x) => ({ ...x, transactionNo: x.transactionNo ?? x.voucherNo, transactionType: x.transactionType || "PCV", customerName: x.customerName || x.cashAccountName || "", netAmount: x.netAmount ?? x.totalAmount ?? 0, invoiceDate: x.invoiceDate || x.voucherDate }))))
      .catch((error) => { if (error?.name !== "AbortError") console.error("Petty cash expense list failed", error); })
      .finally(() => setPcvLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "GR" || !matrixAuth.accessToken || !selectedDate) { setGiRows([]); return; }
    const controller = new AbortController(); setGiLoading(true);
    listGoldReceiptVouchers({ date: selectedDate, session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey }, signal: controller.signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) })
      .then(setGiRows).catch((error) => { if (error?.name !== "AbortError") console.error("Gold receipt voucher list failed", error); }).finally(() => setGiLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "GI" || !matrixAuth.accessToken || !selectedDate) { setGpRows([]); return; }
    const controller = new AbortController(); setGpLoading(true);
    listGoldPaymentVouchers({ date: selectedDate, session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey }, signal: controller.signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) })
      .then(setGpRows).catch((error) => { if (error?.name !== "AbortError") console.error("Gold payment voucher list failed", error); }).finally(() => setGpLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "GFS" || !matrixAuth.accessToken || !selectedDate) { setGfsRows([]); return; }
    const controller = new AbortController(); setGfsLoading(true);
    listSalesGoldFixingVouchers({ date: selectedDate, session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey }, signal: controller.signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) })
      .then(setGfsRows).catch((error) => { if (error?.name !== "AbortError") console.error("Sales gold fixing list failed", error); }).finally(() => setGfsLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "GFP" || !matrixAuth.accessToken || !selectedDate) { setGfpRows([]); return; }
    const controller = new AbortController(); setGfpLoading(true);
    listPurchaseGoldFixingVouchers({ date: selectedDate, session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey }, signal: controller.signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) })
      .then(setGfpRows).catch((error) => { if (error?.name !== "AbortError") console.error("Purchase gold fixing list failed", error); }).finally(() => setGfpLoading(false));
    return () => controller.abort();
  }, [currentKey, selectedDate, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, dispatch]);

  useEffect(() => {
    if (currentKey !== "UGLP" || !matrixAuth.accessToken || !selectedDate) { setUglpRows([]); return; }
    const controller = new AbortController();
    setUglpLoading(true);
    listUnfixedPurchases({ date:selectedDate, session:{ accessToken:matrixAuth.accessToken, refreshToken:matrixAuth.refreshToken, tenantKey:matrixAuth.tenantKey }, signal:controller.signal, onSessionRefreshed:(tokens)=>dispatch(sessionRefreshed(tokens)) })
      .then((rows)=>setUglpRows((rows||[]).map(x=>({ ...x, customerCivilId:x.supplierCivilId, customerPhone:x.supplierPhone, customerName:x.supplierName }))))
      .catch((error)=>{ if(error?.name!=="AbortError") console.error("Unfixed purchase list failed",error); })
      .finally(()=>setUglpLoading(false));
    return ()=>controller.abort();
  }, [currentKey,selectedDate,matrixAuth.accessToken,matrixAuth.refreshToken,matrixAuth.tenantKey,dispatch]);

  useEffect(() => {
    if (currentKey !== "USAL" || !matrixAuth.accessToken || !selectedDate) { setUsalRows([]); return; }
    const controller = new AbortController();
    setUsalLoading(true);
    listUnfixedSales({ date:selectedDate, session:{ accessToken:matrixAuth.accessToken, refreshToken:matrixAuth.refreshToken, tenantKey:matrixAuth.tenantKey }, signal:controller.signal, onSessionRefreshed:(tokens)=>dispatch(sessionRefreshed(tokens)) })
      .then((rows)=>setUsalRows(rows||[]))
      .catch((error)=>{ if(error?.name!=="AbortError") console.error("Unfixed sale list failed",error); })
      .finally(()=>setUsalLoading(false));
    return ()=>controller.abort();
  }, [currentKey,selectedDate,matrixAuth.accessToken,matrixAuth.refreshToken,matrixAuth.tenantKey,dispatch]);

  const [errors, setErrors] = useState({});
  const handleTabChange = (event, newValue) => {
    setCurrentKey(tabsData[newValue].key);
    setTabValue(newValue);
  };
  const onFormChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };
  const tabsData = [
    // { label: "All", key: "" },
    { label: "GSAL", key: "GSAL", content: "Retail" },
    { label: "SCRAP", key: "SCRAP", content: "Scrap" },
    { label: "GRET", key: "GRET", content: "Return" },
    { label: "RV", key: "RV", content: "Receipt Voucher" },
    { label: "PV", key: "PV", content: "Payment Voucher" },
    { label: "PCV", key: "PCV", content: "Petty Cash Voucher" },
    { label: "UGLP", key: "UGLP", content: "Unfixed Purchase" },
    { label: "USAL", key: "USAL", content: "Unfixed Sale" },
    { label: "GR", key: "GR", content: "Gold Receipt Voucher" },
    { label: "GI", key: "GI", content: "Gold Payment Voucher" },
    { label: "GFS", key: "GFS", content: "Sale Gold Fixing Voucher" },
    { label: "GFP", key: "GFP", content: "Purchase Gold Fixing Voucher" },
  ];

  return (
    <>
      <div className="main-section">
        {loading && <Loader />}

        <MainHeading heading=" Invoice List" />
        <Paper
          className="custom-card_001"
          bgcolor={theme.palette.background.default}
          sx={{
            maxWidth: "100%",
            width: "100%",
            textAlign: "center",
          }}
        >
          <CustomTabs
            tabs={tabsData}
            value={tabValue}
            onChange={handleTabChange}
            centered={true}
            styles={{ marginTop: "20px" }}
          />
          <Box sx={{ p: 2 }}>
            <Typography sx={{ textAlign: "left" }} component={"h3"}>
              {tabsData[tabValue]?.content} Invoice Data
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <CustomDatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  errors={errors}
                  size="small"
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          </Box>

          <CommonTable
            columns={columns}
            rows={TableData}
            handleEdit={handleEdit}
            loading={currentKey === "GSAL" ? salesLoading : currentKey === "SCRAP" ? scrapLoading : currentKey === "GRET" ? returnLoading : currentKey === "RV" ? rvLoading : currentKey === "PV" ? pvLoading : currentKey === "PCV" ? pcvLoading : currentKey === "GR" ? giLoading : currentKey === "GI" ? gpLoading : currentKey === "GFS" ? gfsLoading : currentKey === "GFP" ? gfpLoading : currentKey === "UGLP" ? uglpLoading : currentKey === "USAL" ? usalLoading : loading}
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

export default connect(mapStateToProps, mapDispatchToProps)(GoldData);
