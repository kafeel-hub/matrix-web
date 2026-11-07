import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { connect, useDispatch, useSelector } from "react-redux";
import CustomerDetailVoucherForm from "../components/GoldComponents/CustomerDetailVoucherForm";
import Grid from "@mui/material/Grid2";
import Loader from "../components/Loader/Loader";
import {
  calculateGoldRetailPricePerGm,
  calculateGoldRetailAmount,
  calculateGoldRetailPrice,
  calculatePureWeight,
} from "../utilities/TableCalculations/GoldRetail";
// import {
//   validateForm,
//   validateTableRowsData,
// } from "../utilities/Validator/FormValidators";
import {
  CustomInput,
  CustomSelect,
} from "../components/Customcomponents/CustomInputs";

import FooterButtonsGroup from "../components/Customcomponents/FooterButtonsGroup";
import NewTable from "../components/CustomTable/NewTable";
import DiscountSection from "../components/GoldComponents/DiscountSection";
import PaymentBreakdownVoucherTable from "../components/Common/PaymentBreakdownVoucherTable";
import formatDateToISOString from "../utilities/formatDateToISOString";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import MainHeading from "../components/Common/MainHeading";
import CustomButton from "../components/Customcomponents/CustomButton";
import AddItemForm from "../components/GoldComponents/AddItemForm";
import ItemViewTable from "../components/GoldComponents/ItemViewTable";
import {
  paymentTableColumns,
  addpaymentItem,
  customerDetailsRequiredFields,
} from "../constants/PaymentTableConstants";
import {
  validateForm,
  validateTableRowsData,
  validateItemForm,
} from "../utilities/Validator/FormValidators";
import Popup from "../components/Customcomponents/Popup";
import { savePaymentVoucher as savePaymentVoucherApi, getPaymentVoucherLookups, searchPaymentVoucherAccounts, getPaymentVoucher } from "../services/paymentVoucherApi";
import { sessionRefreshed } from "../features/auth/authSlice";
import { getAccountBalance } from "../services/accountBalanceApi";

const PaymentVoucher = ({
  comboBox,
  getItemInformation,
  itemData,
  companyBranchlist,
  CompanyDetails,
  saveRecieptVoucherInvoice,
  createLoading,
  itemloading,
  saveUnfixedPurchaseInvoice,
  getCurrency,
  currencyList,
  saveRecieptVoucher,
  saveRecieptVoucherData,
  saveRecieptVoucherloading,
}) => {
  const { state } = useLocation();
  const { id: routeVoucherNo } = useParams();
  const dispatch = useDispatch();
  const matrixAuth = useSelector((reduxState) => reduxState.auth || {});
  const session = { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey };
  const [pvSaving, setPvSaving] = useState(false);
  const [validationPopup, setValidationPopup] = useState({ show: false, message: "" });
  const [pvLookups, setPvLookups] = useState({ baseCurrencyId: "", paymentTypes: [], currencies: [] });
  const [pvAccounts, setPvAccounts] = useState([]);
  const [accountBalance, setAccountBalance] = useState({ amountBalance: 0, goldBalance: 0 });

  const theme = useTheme();
  const navigate = useNavigate();
  const initialItemFormData = addpaymentItem.reduce((acc, field) => {
    acc[field.key] = field.type === "number" ? 0 : "";
    return acc;
  }, {});

  const [currentProduct, setCurrentProduct] = useState(initialItemFormData);

  const [addItemFormOpen, setAddItemFormOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [rows, setRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);

  const [currentItem, setCurrentItem] = useState({});

  const [formData, setFormData] = useState({
    location: companyBranchlist?.[0]?.fldID || "",
    date: dayjs(),
    vType: "PV",
    vDate: new Date(),
    vNoManual: "", // voucher No
    vActNo: "1123",
    vContraActNo: "",
    vRemark: "", //Remarks
    vAmountF: "",
    vAmount: "",
    vReceivedAmt: "0",
    vCurId: "0",
    vCivilId: "",
    vPhoneNo: "", // Mobile
    vSalesManName: "", //Sales man
    vDiscPer: 1,
    vDiscAmt: "1",
    vNewVoucher: "0",
    vCreatedBy: "001",
    vSysUser: "001",
    vRefNo: "", //Ref no
    vPaidTo: "",
    vAmtType: "1",
    vChqNo: "",
    vChqBank: "767",
    vChqDate: "",
    vChqType: "1",
    vBankCharge: "23",
    vExRate: "0.000",
    vInvNo: "200",
    vInvType: "1",
    vPayFrom: "", // Paid A/c
    vRNo: "0",
  });

  const [errors, setErrors] = useState({});
  const [dataReady, setDataReady] = useState(false);
  const [goldWeight, setGoldWeight] = useState("0.00");
  const [pricePerGrm, setPricePerGrm] = useState("0.00");
  const [fixingAmount, setFixingAmount] = useState("0.00");
  const [itemError, setItemError] = useState({});

  const getItemDetails = (selectedId) => {
    getItemInformation({
      CompanyId: 1,
      ItemCode: selectedId,
    });
  };

  const options =
    comboBox &&
    comboBox?.items?.map((option) => ({
      label: option.fldDisplay,
      value: option.fldID,
    }));

  const paytype = (pvLookups.paymentTypes || []).map((option) => ({
    label: option.paymentTypeName,
    value: option.paymentTypeId,
    AccountNo: option.defaultAccountNo || "",
    AccountName: option.defaultAccountName || "",
  }));
  const act = pvAccounts;
  const updatecurrencyList = (pvLookups.currencies || []).map((option) => ({
    label: option.currencyName,
    value: option.currencyId,
    raw: { ...option, ExRate: option.isBaseCurrency ? 1 : undefined },
  }));

  const loadPvAccounts = React.useCallback(async (search = "") => {
    if (!session.accessToken || !session.tenantKey) return;
    try {
      const result = await searchPaymentVoucherAccounts({ search, page: 1, pageSize: 50, session, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) });
      setPvAccounts((result?.items || []).map((a) => ({ value: a.accountNo, label: a.accountName, fldID: a.accountNo, fldDisplay: `${a.accountNo} ${a.accountName}` })));
    } catch (e) { setValidationPopup({ show: true, message: e?.message || "Unable to load account lookup." }); }
  }, [session.accessToken, session.refreshToken, session.tenantKey, dispatch]);

  useEffect(() => {
    if (!session.accessToken || !session.tenantKey) return;
    (async () => {
      try {
        const lookup = await getPaymentVoucherLookups({ session, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) });
        setPvLookups(lookup || { baseCurrencyId: "", paymentTypes: [], currencies: [] });
        await loadPvAccounts("");
      } catch (e) { setValidationPopup({ show: true, message: e?.message || "Unable to load Payment Voucher lookups." }); }
    })();
  }, [session.accessToken, session.tenantKey, loadPvAccounts, dispatch]);

  useEffect(() => {
    const accountNo = String(formData.recievedAccount || "").trim();
    if (!session.accessToken || !session.tenantKey || !accountNo) {
      setAccountBalance({ amountBalance: 0, goldBalance: 0 });
      return;
    }
    const controller = new AbortController();
    getAccountBalance({
      accountNo, session, signal: controller.signal,
      onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)),
    }).then((balance) => {
      setAccountBalance({
        amountBalance: Number(balance?.amountBalance ?? 0),
        goldBalance: Number(balance?.goldBalance ?? 0),
      });
    }).catch((error) => {
      if (error?.name !== "AbortError") setValidationPopup({ show: true, message: error?.message || "Unable to load account balance." });
    });
    return () => controller.abort();
  }, [formData.recievedAccount, session.accessToken, session.tenantKey, dispatch]);

  useEffect(() => {
    if (!routeVoucherNo || !session.accessToken || !session.tenantKey || !(pvLookups.paymentTypes || []).length) return;
    const controller = new AbortController();
    getPaymentVoucher({
      voucherNo: routeVoucherNo, session, signal: controller.signal,
      onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)),
    }).then((result) => {
      const h = result?.header || {};
      setIsEdit(true);
      setFormSaved(true);
      setFormData((prev) => ({ ...prev, voucherNo: h.voucherNo || routeVoucherNo, invoiceNo: h.voucherNo || routeVoucherNo, date: h.voucherDate ? dayjs(h.voucherDate) : dayjs(), recievedAccount: h.accountNo || "", recievedFrom: h.paidTo || "", refNo: h.manualNo || "", remark: h.remarks || "", mobile: h.phoneNo || "", civilId: h.civilId || "", salesman: h.salesman || "" }));
      setRemarks(h.remarks || "");
      setDiscount(Number(h.discountAmount || 0));
      setRows((result?.payments || []).map((x) => {
        const pt = (pvLookups.paymentTypes || []).find((q) => String(q.paymentTypeId) === String(x.paymentTypeId));
        const cur = (pvLookups.currencies || []).find((q) => String(q.currencyId) === String(x.currencyId));
        return { paytype: pt?.paymentTypeName || x.paymentTypeName || x.paymentTypeId, account: x.accountNo || "", accountName: x.accountName || "", cheaqueNo: x.chequeNo || "", cheaquedate: x.chequeDate ? dayjs(x.chequeDate) : null, chequeBank: x.chequeBank || "", amountLC: Number(x.amount || 0), currency: cur ? { label: cur.currencyName, value: cur.currencyId, raw: cur } : { label: x.currencyName || x.currencyId, value: x.currencyId }, exchangerate: Number(x.exchangeRate || 1), amountFC: Number(x.currencyAmount || (Number(x.amount || 0) / Number(x.exchangeRate || 1))) };
      }));
    }).catch((e) => { if (e?.name !== "AbortError") setValidationPopup({ show: true, message: e?.message || "Unable to retrieve Payment Voucher." }); });
    return () => controller.abort();
  }, [routeVoucherNo, session.accessToken, session.tenantKey, pvLookups.paymentTypes, pvLookups.currencies, dispatch]);

  useEffect(() => {
    if (itemData && itemData?.ItmCode) {
      const isItembarCodeValid =
        itemData.ItmBarCode !== null &&
        itemData.ItmBarCode !== "" &&
        itemData.ItmBarCode !== "0" &&
        itemData.ItmBarCode !== 0;

      const grossWt = isItembarCodeValid
        ? parseFloat(itemData.ItmStockAll) || 0
        : 0;

      const updatedProductDetails = {
        ...currentProduct,
        description: itemData.ItmName || "",
        purity: itemData.ItmGoldPurityNo || "",
        qty: parseFloat(itemData.TranItmGoldAmt) || 1,
        grossWt: grossWt,
        deductionWt: parseFloat(itemData.dedWgt) || 0,
        deductionPrcnt: parseFloat(itemData.ded) || 0,
        goldPrice: parseFloat(itemData.ItmSalePrice) || 0,
      };

      updatedProductDetails.netWt =
        updatedProductDetails.grossWt - updatedProductDetails.deductionWt;
      updatedProductDetails.pureWeight = calculatePureWeight({
        netWt: updatedProductDetails.netWt,
        purity: updatedProductDetails.purity,

        digits: 3,
      });
      updatedProductDetails.price = updatedProductDetails.goldPrice;
      updatedProductDetails.amount = calculateGoldRetailAmount({
        price: updatedProductDetails.price,
        qty: updatedProductDetails.qty,
        digits: 3,
      });

      setCurrentProduct({ ...currentProduct, ...updatedProductDetails });
      setItemError({});
    }
  }, [itemData]);

  const handleFormChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const [discount, setDiscount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [formSaved, setFormSaved] = useState(false);

  const totalAmount = rows.reduce(
    (sum, row) => sum + parseFloat(row.amount || 0),
    0,
  );
  const totalPureWeight = rows.reduce(
    (sum, row) => sum + parseFloat(row.pureWeight || 0),
    0,
  );
  const totalWeight = rows.reduce(
    (sum, row) => sum + parseFloat(row.netWt || 0),
    0,
  );
  const netAmount = totalAmount - parseFloat(discount || 0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  function formatedItemData(data) {
    let newData = [];
    if (data) {
      newData = data.map((item, index) => {
        return {
          ProdSrNo: index + 1,
          ProdTranTypeId: "0",
          ProdBarcode: "TESTFAKE-14",
          ProdName: "testfake",
          ProdId: item.itemCode.value,
          ProdNameInv: item.description,
          ProdMcCost: "0.000",
          ProdGoldPurity: item.purity || "0.000",
          ProdQty: item.qty || "0.000",
          ProdMcTypeId: item.mcType || "0.000",
          ProdGoldWgt: item.grossWt || "0.000",
          ProdGoldPureWgt: item.pureWeight || "0.000",
          ProdStoneWgt: item.stoneWt || "0.000",
          ProdGoldNetWgt: item.netWt || "0.000",
          ProdStoneAmount: item.stoneAmount || "0.000",
          // ProdGoldRate: item.goldPrice || "0.000",
          ProdMcRate: item.mcgm || "0.000",
          ProdRate: item.unitPricePerGm || "0.000",
          ProdAmount: item.amount || "0.000",
          ProdTaxPer: "0",
          ProdRepairWgt: "0",
          ProdRepairFlag: "0",
          ProdMcAmount: "0",
          ProdGoldAmount: "0",
          ProdDedWgt: item.deductionWt || "0",
          ProdDedPer: item.deductionPrcnt || "0",
        };
      });
      return newData;
    }
    return newData;
  }
  function formatedCusDetails(data) {
    let newData = [];
    if (data) {
      console.log(data, "data");
      newData = {
        vType: data.vType || "",
        vDate: formatDateToISOString(data.date) || "",
        vNoManual: data.vNoManual || "",
        vActNo: data.recievedAccount || "",
        vContraActNo: data.vContraActNo || "",
        vActName: data.recievedAccount || "",
        vRemark: data.remark || "",
        vAmountF: data.vAmountF || "0",
        vAmount: data.vAmount || "0",
        vReceivedAmt: data.vReceivedAmt || "0",
        vCurId: data.vCurId || "",
        vCivilId: data.vCivilId || "0",
        vPhoneNo: data.vPhoneNo || "0",
        vSalesManName: data.vSalesManName || "",
        vDiscPer: data.vDiscPer || "",
        vDiscAmt: data.vDiscAmt || "0",
        vNewVoucher: data.vNewVoucher || "",
        vCreatedBy: data.vCreatedBy || "",
        vSysUser: data.vSysUser || "",
        vRefNo: data.refNo || "0",
        vPaidTo: data.vPaidTo || "",
        vAmtType: data.vAmtType || "",
        vChqNo: data.vChqNo || "0",
        vChqBank: data.vChqBank || "",
        vChqDate: data.vChqDate || "",
        vChqType: data.vChqType || "",
        vBankCharge: data.vBankCharge || "0",
        vExRate: data.vExRate || "1",
        vInvNo: data.vInvNo || "0",
        vInvType: data.vInvType || "",
        vPayFrom: "0",
        vRNo: data.vRNo || "",
      };
      setPricePerGrm(data.FixGoldRate);
      setFixingAmount(data.FixAmount);
      setGoldWeight(data.FixGoldWeight);
      return newData;
    }
    return newData;
  }

  function formatedPaymentBreakdown(data) {
    console.log(data, "saving payment");
    const strPaymentTable = data.map((item, index) => {
      return {
        PaySrNo: index + 1,
        PayId: item?.payType?.value ?? "",
        PayAmt: String(item?.amountFC ?? "0.000"),
        PayCurId: item?.payType?.value ?? "",
        PayCurExRate: item?.exchangerate || "1",
        PayCurAmt: item?.amountFC || "1",
        PayChqNo: item?.cheaqueNo || "123",
        PayActNo: item?.account || "123",
        PayChqDate: item?.cheaquedate || "",
        PayActName: item?.accountName || "Cash And Bank Balances",
        PayName: "",
        PayChqBank: "",
      };
    });
    return strPaymentTable;
  }

  const numberString = Object.keys(saveRecieptVoucherData)
    .filter((key) => !isNaN(key)) // only numeric keys
    .sort((a, b) => a - b) // sort keys numerically
    .map((key) => saveRecieptVoucherData[key]) // get values
    .join(""); // join into one string

  const finalNumber = parseInt(numberString, 10);
  useEffect(() => {
    if (formSaved && saveRecieptVoucherData) {
      setFormData((prevState) => ({
        ...prevState,
        invoiceNo: finalNumber,
      }));
    }
  }, [formSaved, saveRecieptVoucherData]);
  const buildPaymentVoucherRequest = () => {
    const baseCurrency = pvLookups.baseCurrencyId || "";
    const paymentTypeId = (row) => {
      const raw = row?.paytype?.value ?? row?.paytype ?? "";
      const byId = paytype.find((x) => String(x.value) === String(raw));
      const byLabel = paytype.find((x) => String(x.label) === String(raw));
      return String((byId || byLabel)?.value ?? raw).trim();
    };
    const currencyId = (row) => {
      const raw = row?.currency?.value ?? row?.currency?.label ?? row?.currency ?? "";
      const list = pvLookups.currencies || [];
      const match = list.find((x) => String(x.currencyId) === String(raw) || String(x.currencyName) === String(raw));
      return String(match?.currencyId ?? raw ?? baseCurrency).trim() || baseCurrency;
    };
    return {
      header: {
        voucherDate: dayjs(formData.date).format("YYYY-MM-DD"),
        accountNo: String(formData.recievedAccount || "").trim(),
        manualNo: String(formData.refNo || formData.vNoManual || "").trim(),
        paidTo: String(formData.recievedFrom || formData.vPaidTo || "").trim(),
        remarks: String(formData.remark || remarks || "").trim(),
        civilId: String(formData.civilId || formData.vCivilId || "").trim(),
        phoneNo: String(formData.mobile || formData.vPhoneNo || "").trim(),
        salesman: String(formData.salesman || formData.vSalesManName || "").trim(),
        discountPercentage: 0,
        discountAmount: Number(discount || 0),
      },
      payments: rows.map((row, index) => ({
        lineNo: index + 1,
        paymentTypeId: paymentTypeId(row),
        amount: Number(row.amountLC || 0),
        accountNo: String(row?.account?.value ?? row?.account ?? "").trim(),
        currencyId: currencyId(row),
        exchangeRate: Number(row.exchangerate || 1),
        currencyAmount: Number(row.amountFC || 0),
        chequeBank: String(row.chequeBank || row.cheaqueBank || "").trim(),
        chequeNo: String(row.cheaqueNo || "").trim(),
        chequeDate: row.cheaquedate ? dayjs(row.cheaquedate).format("YYYY-MM-DD") : null,
      })),
    };
  };

  const handleSubmit = async () => {
    if (pvSaving || formSaved) {
      if (formSaved) setValidationPopup({ show: true, message: "This Payment Voucher has already been saved. Use New/Clear before creating another voucher." });
      return;
    }
    try {
      if (!String(formData.recievedAccount || "").trim()) {
        setValidationPopup({ show: true, message: "Please select the Received Account." });
        return;
      }
      if (!formData.date || !dayjs(formData.date).isValid()) {
        setValidationPopup({ show: true, message: "Please select a valid voucher date." });
        return;
      }
      if (!rows.length) {
        setValidationPopup({ show: true, message: "Please add at least one payment." });
        return;
      }
      const invalidRow = rows.findIndex((row) => !String(row?.paytype?.value ?? row?.paytype ?? "").trim() || Number(row?.amountLC || 0) <= 0);
      if (invalidRow >= 0) {
        setValidationPopup({ show: true, message: `Payment row ${invalidRow + 1} requires a payment type and amount greater than zero.` });
        return;
      }
      if (!session.accessToken || !session.tenantKey) {
        setValidationPopup({ show: true, message: "Your authenticated session is not available. Please sign in again." });
        return;
      }

      setPvSaving(true);
      const result = await savePaymentVoucherApi({
        request: buildPaymentVoucherRequest(),
        session,
        onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)),
      });
      setFormSaved(true);
      setFormData((prev) => ({ ...prev, voucherNo: result.voucherNo || "", invoiceNo: result.voucherNo || "" }));
      setValidationPopup({
        show: true,
        message: result.posted
          ? `Payment voucher ${result.voucherNo} saved and posted successfully.`
          : `Payment voucher ${result.voucherNo} was saved, but posting requires attention. ${result.message || ""}`,
      });
    } catch (error) {
      setValidationPopup({ show: true, message: error?.message || "Unable to save payment voucher." });
    } finally {
      setPvSaving(false);
    }
  };

  const handleItemDelete = (index) => {
    setShowPopup(true);
    setEditIndex(index);
  };

  const handleItemDeleteConfirm = () => {
    if (editIndex === null) {
      setRows([]);
    } else {
      setRows(rows.filter((_, i) => i !== editIndex)); // Delete only the selected row
    }
    setShowPopup(false);
    setEditIndex(null);
  };

  const resetItemFormState = () => {
    setCurrentProduct(initialItemFormData);
    setFormSaved(false);
  };

  const handleItemFormChange = (e) => {
    const fieldName = e.target.name;
    const value = e.target.value;

    const updatedRow = { ...currentProduct, [fieldName]: value };
    console.log(currentProduct, fieldName, "formDatachange");

    if (fieldName === "amountLC" || fieldName === "exchangerate") {
      const amountLC = parseFloat(updatedRow.amountLC || 0);
      const exchangerate = parseFloat(updatedRow.exchangerate || 0);
      updatedRow.amountFC = exchangerate > 0 ? parseFloat((amountLC / exchangerate).toFixed(3)) : 0;
    }

    setCurrentProduct(updatedRow);
    setItemError((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleAddItemSave = () => {
    let isValid = true;
    if (!validateItemForm(addpaymentItem, setItemError, currentProduct)) {
      isValid = false;
    }
    if (!isValid) {
      console.error("Validation Errors: ", errors);
      return;
    }
    console.log(currentProduct, "adding data");
    const selectedPaytype =
      paytype.find((pt) => pt.value === currentProduct.paytype) || null;
    const formattedProduct = {
      ...currentProduct,
      paytype:
        selectedPaytype?.label ||
        currentProduct.paytype?.value ||
        currentProduct?.paytype,
      account:
        currentProduct.account?.value ||
        currentProduct?.account ||
        currentProduct?.account?.label,
      currency: currentProduct.currency || null,
    };
    if (editIndex !== null) {
      const updatedItems = [...rows];
      updatedItems[editIndex] = formattedProduct;
      setRows(updatedItems);
    } else {
      setRows([...rows, formattedProduct]);
    }
    setAddItemFormOpen(false);
    resetItemFormState();
    console.log(rows, currentProduct, "rows");
  };
  const handleEdit = (index) => {
    const productToEdit = rows[index];
    const match = paytype.find((pt) => pt.label === productToEdit.paytype);

    setCurrentProduct({
      ...productToEdit,
      paytype: match?.value || null,
      currency:
        typeof productToEdit.currency === "object" && productToEdit.currency !== null
          ? productToEdit.currency
          : updatecurrencyList.find((c) => c.label === productToEdit.currency || c.value === productToEdit.currency) || null,
    });
    setEditIndex(index);
    setAddItemFormOpen(true);
  };
  const handleList = (type) => {
    navigate(`/gold-data-table`, {
      state: { type: type },
    });
  };

  useEffect(() => {
    if (state) {
      setIsEdit(true);
      const formattedDate = state.formData.date
        ? dayjs(state.formData.date)
        : null;
      setFormData((prevState) => ({
        // ...prevState,
        ...state.formData,
        date: formattedDate,
      }));
      setRows(() => state.itemsDetails);
      setDataReady(false);
      setTimeout(() => setDataReady(true), 0);
    }
  }, [state]);

  useEffect(() => {
    if (dataReady) {
      setPaymentRows(state.paymentDetails.paymentDetails);
    }
  }, [dataReady, state]);

  return (
    <>
      <div className="main-section">
        <MainHeading
          heading={`Payment Voucher Invoice${
            formData.voucherNo && !isNaN(parseInt(formData.voucherNo))
              ? ` - ${parseInt(formData.voucherNo)}`
              : ""
          }`}
        />
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
            <CustomerDetailVoucherForm
              data={comboBox}
              formData={formData}
              errors={errors}
              onFormChange={handleFormChange}
              type="GFS"
              currencyList={currencyList}
              accountType={pvAccounts}
              accountBalance={accountBalance}
              accountSearchAction={loadPvAccounts}
              accountLabel="Paid Account"
              contraAccountLabel="Paid To"
            />
          </Box>

          <Divider sx={{ mt: 0 }} />
          {saveRecieptVoucherloading && <Loader />}
          <Box sx={{ p: 2 }}>
            <ItemViewTable
              rows={rows}
              columns={paymentTableColumns}
              onEdit={handleEdit}
              onDelete={handleItemDelete}
              type={"payment"}
            />
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <PaymentBreakdownVoucherTable
                paymentRows={paymentRows}
                setPaymentRows={setPaymentRows}
                netAmount={netAmount}
                paymentOptions={paytype}
                accountType={act}
                setRemainingBalance={setRemainingAmount}
                remainingBalance={remainingAmount}
                type={"GFS"}
                currencyList={updatecurrencyList}
                rows={rows}
                setRows={setRows}
                modalOpen={addItemFormOpen}
                setModalOpen={setAddItemFormOpen}
                formData={currentProduct}
                fetchProductDetails={getItemDetails}
                setFormData={setCurrentProduct}
                options={options}
                resetState={resetItemFormState}
                handleSubmit={handleAddItemSave}
                onFormChange={handleItemFormChange}
                fields={addpaymentItem}
                loading={itemloading}
                errors={itemError}
                setErrors={setItemError}
                currentItemEdit={editIndex}
                CompanyDetails={CompanyDetails}
                restrictAccountToPaymentType={true}
                baseCurrencyId={pvLookups.baseCurrencyId}
              />
            </Grid>
            <Grid container spacing={2}>
              <Grid
                size={{ xs: 12, md: 12, lg: 12 }}
                sx={{ mt: 2, textAlign: "left" }}
              >
                <CustomButton
                  onClick={() => {
                    setAddItemFormOpen(true);
                    resetItemFormState();
                    setEditIndex(null);
                    setItemError({});
                  }}
                  text="Add Payment"
                  // theme={theme}
                  sx={{ mt: 2 }}
                  // variantType="dark"
                  type="submit"
                  disabled={itemloading}
                  loading={itemloading}
                  // startIcon={<AddIcon />}
                />
              </Grid>
            </Grid>
            <Grid
              className="invoice-table-payment-section-main"
              container
              spacing={3}
              sx={{ flexGrow: 1, mt: 5 }}
            >
              <Grid
                size={{ xs: 12, md: 5, lg: 5 }}
                sx={{ display: "flex" }}
              ></Grid>

              <Grid
                size={{ xs: 12, md: 5, lg: 5 }}
                offset={{ xs: 0, md: 2, lg: 2 }}
              >
                <DiscountSection
                  totalAmount={totalAmount}
                  discount={discount}
                  setDiscount={setDiscount}
                  netAmount={netAmount}
                  remarks={remarks}
                  setRemarks={setRemarks}
                  goldWeight={goldWeight}
                  pricePerGrm={pricePerGrm}
                  fixingAmount={fixingAmount}
                  type={"GFS"}
                />
              </Grid>
            </Grid>
          </Box>

          <FooterButtonsGroup
            isEdit={isEdit}
            isSaving={pvSaving}
            handleSave={handleSubmit}
            setFormData={setFormData}
            setRows={setRows}
            setRemainingAmount={setRemainingAmount}
            setDataReady={setDataReady}
            setRemarks={setRemarks}
            setDiscount={setDiscount}
            setPaymentRows={setPaymentRows}
            setErrors={setErrors}
            rows={rows}
            discount={discount}
            paymentRows={paymentRows}
            remarks={remarks}
            remainingAmount={remainingAmount}
            type={"GFS"}
            handleList={() => handleList("PV")}
            handleDelete={handleItemDelete}
          />
          <Popup
            show={validationPopup.show}
            setShow={(show) => setValidationPopup((prev) => ({ ...prev, show }))}
            message={validationPopup.message}
            description=""
            okOnly
          />
          <Popup
            show={showPopup}
            setShow={setShowPopup}
            message={
              editIndex === null
                ? "Are you sure you want to Clear Invoice?"
                : "Are you sure you want to delete"
            }
            description=""
            handleConfirm={handleItemDeleteConfirm}
          />
        </Paper>
      </div>
    </>
  );
};
const mapStateToProps = ({ auth = {}, demo = {}, invoice = {} }) => ({
  comboBox: _.get(auth, "comboBox", []),
  itemData: _.get(demo, "itemData", []),
  companyBranchlist: _.get(auth, "companyBranchList", []),
  CompanyDetails: _.get(auth, "CompanyDetails", []),
  createLoading: _.get(auth, "invoiceloading", false),
  itemloading: _.get(demo, "itemloading", false),
  currencyList: _.get(demo, "currencyList", []),
  saveRecieptVoucherloading: _.get(invoice, "saveRecieptVoucherloading", false),
  saveRecieptVoucherData: _.get(invoice, "saveRecieptVoucherData", {}),
});

const mapDispatchToProps = (dispatch) => ({
  getItemInformation: (data) =>
    dispatch({ type: "getItemInformationcalled", payload: data }),
  saveRecieptVoucher: (data) =>
    dispatch({ type: "saveRecieptVouchercalled", payload: data }),
  getCurrency: (data) => dispatch({ type: "getCurrencycalled", payload: data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentVoucher);
