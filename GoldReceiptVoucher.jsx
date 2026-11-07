import React, { useEffect, useState, useMemo, useRef } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { connect, useDispatch, useSelector } from "react-redux";
import CustomerInputForm from "../components/GoldComponents/CustomerInputForm";
import Grid from "@mui/material/Grid2";
import Loader from "../components/Loader/Loader";
import { clearData } from "../features/demo/demoSlice";
import {
  calculateGoldRetailPricePerGm,
  calculateGoldRetaildedAmount,
  calculateGoldRetailPrice,
  calculatePureWeight,
} from "../utilities/TableCalculations/GoldRetail";

import {
  CustomInput,
  CustomSelect,
} from "../components/Customcomponents/CustomInputs";

import FooterButtonsGroup from "../components/Customcomponents/FooterButtonsGroup";
import NewTable from "../components/CustomTable/NewTable";
import DiscountSection from "../components/GoldComponents/DiscountSection";
import PaymentBreakdownTable from "../components/Common/PaymentBreakdownTable";
import formatDateToISOString from "../utilities/formatDateToISOString";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import MainHeading from "../components/Common/MainHeading";
import CustomButton from "../components/Customcomponents/CustomButton";
import AddItemForm from "../components/GoldComponents/AddItemForm";
import ItemViewTable from "../components/GoldComponents/ItemViewTable";
import {
  itemTableColumns,
  addItemFormFields,
  customerDetailsRequiredFields,
} from "../constants/GoldReciepientVoucher";
import {
  addpaymentItem,
  paymentTableColumns,
} from "../constants/PaymentTableConstants";

import {
  validateForm,
  validateTableRowsData,
  validateItemForm,
} from "../utilities/Validator/FormValidators";
import Popup from "../components/Customcomponents/Popup";
import PaymentBreakdownVoucherTable from "../components/Common/PaymentBreakdownVoucherTable";
import { saveGoldReceiptVoucher as saveGoldReceiptVoucherApi } from "../services/goldReceiptVoucherApi";
import { sessionRefreshed } from "../features/auth/authSlice";

const GoldReceiptVoucher = ({
  comboBox,
  getItemInformation,
  getPartyInformation,
  itemData,
  partyData,
  companyBranchlist,
  CompanyDetails,
  saveRecieptVoucherInvoice,
  createLoading,
  itemloading,
  saveUnfixedPurchaseInvoice,
  receiptVoucherloading,
  partyloading,
  partyLoading,
  receiptVoucherData,
  getParty,
  getCurrency,
  partyList,
  clearPartyData,
  currencyList,
  authData,
}) => {
  const { state } = useLocation();
  const dispatch = useDispatch();
  const matrixAuth = useSelector((reduxState) => reduxState.auth || {});
  const session = { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey };
  const [grSaving, setGrSaving] = useState(false);
  const requestedPartyIdRef = useRef(null);

  const theme = useTheme();
  const navigate = useNavigate();

  const initialItemFormData = addItemFormFields.reduce((acc, field) => {
    acc[field.key] = field.type === "number" ? 0 : "";
    return acc;
  }, {});
  const initialItempayment = addpaymentItem.reduce((acc, field) => {
    acc[field.key] = field.type === "number" ? 0 : "";
    return acc;
  }, {});
  const [currentProduct, setCurrentProduct] = useState(initialItemFormData);
  const [currentPayment, setCurrentPayment] = useState(initialItempayment);

  const [addItemFormOpen, setAddItemFormOpen] = useState(false);
  const [addPaymentFormOpen, setAddPaymentFormOpen] = useState(false);
  const [payrows, setPayRows] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [partyDataReady, setpartyDataReady] = useState(null);

  const [rows, setRows] = useState([]);

  // const [rows, setRows] = useState([]);

  const [paymentRows, setPaymentRows] = useState([]);

  const [currentItem, setCurrentItem] = useState({});

  const [formData, setFormData] = useState({
    location: "",
    invoiceNo: "",
    date: dayjs(),
    refNo: "",

    supplierRef: "",
    civilId: "",
    mobile: "",

    phone: "",

    contactPerson: "",
    customerPhone: "",
    companyCRNo: "",
    party: "",
    partyName: "",
    personPhone: "",
    amount: "",
    gold: "",
  });

  const [errors, setErrors] = useState({});
  const [dataReady, setDataReady] = useState(false);
  const [goldWeight, setGoldWeight] = useState("0.00");
  const [pricePerGrm, setPricePerGrm] = useState("0.00");
  const [fixingAmount, setFixingAmount] = useState("0.00");
  const [itemError, setItemError] = useState({});
  const [type, setType] = useState({});

  useEffect(() => {
    return () => {
      clearPartyData(); //
    };
  }, []);
  useEffect(() => {
    getParty({ companyId: 1 });
    getCurrency({ companyId: 1 });
  }, []);
  const getItemDetails = (selectedId) => {
    getItemInformation({
      CompanyId: 1,
      ItemCode: selectedId,
    });
  };
  const getPartyDetails = (selectedId) => {
    requestedPartyIdRef.current = selectedId;
    getPartyInformation({
      CompanyId: 1,
      partyId: selectedId,
    });
  };

  const paytype =
    comboBox &&
    comboBox?.paytype?.map((option) => ({
      label: option.fldDisplay,
      value: option.fldID,
      AccountNo: option.fldAccountNo,
    }));
  const act = Array.isArray(comboBox?.payAccount)
    ? comboBox.payAccount
    : [];
  const updatecurrencyList =
    currencyList &&
    currencyList?.dtCurrency?.map((option) => ({
      label: option.CurName,
      value: option.CurId,
    }));
  // Safe while bootstrap/lookups are still loading.
  const options = Array.isArray(comboBox?.items)
    ? comboBox.items.map((option) => ({
        label: option.fldDisplay,
        value: option.fldID,
      }))
    : [];
  console.log(rows, paymentRows, "rows");
  useEffect(() => {
    const party =
      Array.isArray(partyData?.dtParty) && partyData?.dtParty.length > 0
        ? partyData?.dtParty[0]
        : null;
    if (
      party &&
      String(party?.Prt_Id) === String(requestedPartyIdRef.current)
    ) {
      const crNo = partyData?.dtParty[0]?.Prt_CrNo;
      // console.log("Setting CR No:", crNo);
      setFormData((prev) => ({
        ...prev,
        civilId: party?.Prt_CivilId || "",
        companyCRNo: crNo || "",
        contactPerson: party?.Prt_Person || "",
        party: party?.Prt_Id || "",
        partyName: party?.Prt_Name || "",
        phone: party?.Prt_Phone || "",
        customerPhone: party?.Prt_Phone || "",
        amount: party?.BalaceAmount?.toString() || "",
        gold: party?.BalanceGold?.toString() || "",
        mobile: party?.Prt_Phone || "",
      }));
    } else {
      setFormData({
        location: "",
        invoiceNo: "",
        date: dayjs(),
        refNo: "",

        supplierRef: "",
        civilId: "",
        mobile: "",

        phone: "",

        contactPerson: "",
        customerPhone: "",
        companyCRNo: "",
        party: "",
        partyName: "",
        personPhone: "",
        amount: "",
        gold: "",
      });
    }
  }, [partyData]);

  useEffect(() => {
    if (itemData && itemData[0]?.Prod_Id) {
      const isItembarCodeValid =
        itemData[0]?.ItmBarCode !== null &&
        itemData[0]?.ItmBarCode !== "" &&
        itemData[0]?.ItmBarCode !== "0" &&
        itemData[0]?.ItmBarCode !== 0;

      const grossWt = isItembarCodeValid
        ? parseFloat(itemData[0]?.Prod_GWeight) || 0
        : 0;
      const stoneAmount =
        !isItembarCodeValid &&
        (itemData[0]?.TranStoneAmt === null ||
          itemData[0]?.TranStoneAmt === "" ||
          itemData[0]?.TranStoneAmt === undefined)
          ? 0
          : parseFloat(itemData[0]?.TranStoneAmt);

      const updatedProductDetails = {
        ...currentProduct,
        description: itemData[0]?.Prod_Name || "",
        purity: itemData[0]?.Prod_GoldPurity || "",
        qty: parseFloat(itemData[0]?.TranItmGoldAmt) || 1,
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
      updatedProductDetails.amount = calculateGoldRetaildedAmount({
        price: updatedProductDetails.price,
        qty: updatedProductDetails.qty,
        grossWt: updatedProductDetails.grossWt,
        deductionWt: updatedProductDetails.deductionWt,
        digits: 3,
      });

      setCurrentProduct({ ...currentProduct, ...updatedProductDetails });
      setItemError({});
    }
  }, [itemData]);
  const handleFormChange = (fieldName, value) => {
    if (fieldName === "party" || fieldName == "partyName") {
      getPartyDetails(value);
    }
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
          ProdBarcode: item.itemCode.value || "TESTFAKE-14",
          // ProdName: "testfake",
          ProdId: item.itemCode.value,
          ProdNameInv: item.description,
          ProdMcCost: "0.000",
          ProdGoldPurity: item.purity || "0.000",
          ProdQty: item.qty || "0.000",
          ProdMcTypeId: "0",
          ProdGoldWgt: item.grossWt || "0.000",
          ProdGoldPureWgt: item.pureWeight || "0.000",
          ProdStoneWgt: item.stoneWt || "0.000",
          ProdGoldNetWgt: item.netWt || "0.000",
          ProdStoneAmount: item.stoneAmount || "0.000",
          ProdGoldRate: item.goldPrice || "0",
          ProdMcRate: item.mcgm || "0.000",
          ProdRate: item.unitPricePerGm || "0.000",
          ProdAmount: item.amount || "0.000",
          ProdTaxPer: "0",
          ProdRepairWgt: "0",
          ProdRepairFlag: "0",
          // ProdMcAmount: "0",
          ProdGoldAmount: "0",
          ProdDedWgt: item.deductionWt || "0",
          ProdDedPer: item.deductionPrcnt || "0",
          ProdName: item.description,
          // ProdGoldPureWgt: "0.00",
          // ProdTaxPer: "2",
          ProdMcAmount: item?.mcPerGm || "0.00",
          // ProdGoldAmount: "0.00",
          // ProdDedPer: "0.00",
          // ProdDedWgt: "0.00",
          // ProdRepairFlag: "1",
          // ProdRepairWgt: "12",
          // ProdBarcode: item.itemCode.value || "",
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
        TranFinYear: CompanyDetails[0].FinancialYear,
        TranLocId: data?.location || "1",
        TranCompanyId: authData?.companyId || "1",

        TranType: "GR",
        TranNo: parseInt(data.invoiceNo) || 0,
        TranDate: formatDateToISOString(data.date),
        // TranPrtName: data.supplier,
        TranPrtCountry:
          comboBox &&
          comboBox.country.find((item) => item.fldID == data.nationality)
            ?.fldDisplay,
        TranPrtPhone: data.customerPhone,
        TranPrtMobile: data.mobile,
        TranPrtCivilId: data.civilId,
        TranPrtArea: data.area,
        TranInvType: "0",
        TranRef: data.refNo || "0.000",
        TranSManId: data.salesman,
        TranGoldRate: "0",

        TranScrapAmt: "0.000",
        TranRemark1: data.remarks || "",
        TranSysUser: "001",
        // TranCreditDays: data.creditDays || "",
        TranDiscAmt: discount || "0",
        TranNetAmt: netAmount || "0",
        TranPrtCrNo: data.companyCRNo || "",
        // TranPrtId: data.supplier || "",
        TranPrtPerson: data.contactPerson || "",
        TranVrNo: data.supplierRef || "",
        TranTotalAmt: totalAmount || "0",
        // TranVrNo: data.supplierInvoice,
        Print_CloseAmt: "0",
        Print_CloseGold: "0",
        TranFixingGold: "0.00",
        TranFixingGoldAmt: "0.00",
        TranFixingGoldRate: "0.00",
        TranPrtPersonPhone: data.personPhone || "",
        aStockGold: "",
        TranPrtName: data.partyName,
        TranPrtId: data.party,
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
        PayAmt: String(item?.amount ?? "0.000"),
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
  const numberString = Object.keys(receiptVoucherData)
    .filter((key) => !isNaN(key)) // only numeric keys
    .sort((a, b) => a - b) // sort keys numerically
    .map((key) => receiptVoucherData[key]) // get values
    .join(""); // join into one string

  const finalNumber = parseInt(numberString, 10);
  useEffect(() => {
    if (formSaved && receiptVoucherData) {
      setFormData((prevState) => ({
        ...prevState,
        invoiceNo: finalNumber,
      }));
    }
  }, [formSaved, receiptVoucherData]);
  const [filteredPartyItems, setFilteredPartyItems] = useState([]);

  const handleSubmit = async () => {
    try {
      if (grSaving) return;
      if (!formData.party) { alert("Please select a party."); return; }
      if (rows.length < 1) { setErrors((prev) => ({ ...prev, general: "Please add at least one item." })); return; }
      if (!session.accessToken || !session.tenantKey) { alert("Your authenticated session is not available. Please sign in again."); return; }

      const payments = payrows.map((p, index) => ({
        lineNo: index + 1,
        paymentTypeId: String(p?.payType?.value ?? p?.paytype?.value ?? p?.paytype ?? ""),
        amount: Number(p?.amountLC ?? p?.amount ?? 0),
        currencyId: String(p?.currency?.value ?? p?.currency ?? "001"),
        exchangeRate: Number(p?.exchangerate || 1),
        currencyAmount: Number(p?.amountFC || 0),
        accountNo: String(p?.account?.value ?? p?.account ?? ""),
        chequeNo: String(p?.cheaqueNo ?? p?.chequeNo ?? ""),
        chequeDate: p?.cheaquedate ? dayjs(p.cheaquedate).format("YYYY-MM-DD") : null,
        authorizationCode: String(p?.authorizationCode ?? ""),
      }));

      const request = {
        header: {
          invoiceDate: dayjs(formData.date).format("YYYY-MM-DD"),
          invoiceType: 0,
          referenceNo: String(formData.refNo || ""),
          partyId: String(formData.party || ""),
          customerName: String(formData.partyName || ""),
          customerCivilId: String(formData.civilId || ""),
          customerMobile: String(formData.mobile || ""),
          customerPhone: String(formData.customerPhone || formData.phone || ""),
          customerCrNo: String(formData.companyCRNo || ""),
          contactPerson: String(formData.contactPerson || ""),
          contactPersonPhone: String(formData.personPhone || ""),
          salesmanId: String(formData.salesman || ""),
          goldRate: 0,
          netAmount: Number(netAmount || 0),
          discountAmount: Number(discount || 0),
          scrapAmount: 0,
          remarks: String(remarks || formData.remarks || ""),
        },
        items: rows.map((item, index) => ({
          lineNo: index + 1,
          itemId: String(item?.itemCode?.value ?? item?.itemCode ?? ""),
          barcode: String(item?.itemCode?.value ?? item?.itemCode ?? ""),
          itemDescription: String(item.description || ""),
          transactionTypeId: 0, makingTypeId: 0,
          goldPurity: Number(item.purity || 0), quantity: Number(item.qty || 0),
          goldWeight: Number(item.grossWt || 0), stoneWeight: Number(item.stoneWt || 0),
          goldNetWeight: Number(item.netWt || 0), goldPureWeight: Number(item.pureWeight || 0),
          goldRate: Number(item.goldPrice || 0), makingRate: Number(item.mcgm || 0), makingCost: 0,
          rate: Number(item.unitPricePerGm || 0), amount: Number(item.amount || 0),
          makingAmount: Number(item.mcPerGm || 0), goldAmount: 0, stoneAmount: Number(item.stoneAmount || 0),
          taxPercentage: 0, deductionWeight: Number(item.deductionWt || 0), deductionPercentage: Number(item.deductionPrcnt || 0),
          repairFlag: false, repairWeight: 0,
        })),
        payments,
      };

      setGrSaving(true);
      const result = await saveGoldReceiptVoucherApi({ request, session, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) });
      setFormSaved(true);
      setFormData((prev) => ({ ...prev, invoiceNo: result.transactionNo || "" }));
      alert(result.posted ? `Gold Receipt ${result.transactionNo} saved and posted successfully.` : `Gold Receipt ${result.transactionNo} saved, but posting requires attention. ${result.message || ""}`);
    } catch (error) {
      alert(error?.message || "Unable to save Gold Receipt Voucher.");
    } finally { setGrSaving(false); }
  };

  const handleEdit = (index) => {
    setCurrentProduct(rows[index]);
    setEditIndex(index);
    setAddItemFormOpen(true);
    console.log("Edit item:", rows[index]);
  };

  const handleItemDelete = (index) => {
    setShowPopup(true);
    setEditIndex(index);
  };
  const handlePayDelete = (index) => {
    setType("payment");
    setShowPopup(true);
    setEditIndex(index);
  };
  const handlePayDeleteConfirm = () => {
    if (editIndex === null) {
      setPayRows([]);
    } else {
      setPayRows(payrows.filter((_, i) => i !== editIndex)); // Delete only the selected row
    }
    setShowPopup(false);
    setEditIndex(null);
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
    setCurrentPayment(initialItempayment);
    setFormSaved(false);
  };

  const handleAddItemSave = () => {
    let isValid = true;
    if (!validateItemForm(addItemFormFields, setItemError, currentProduct)) {
      isValid = false;
    }
    if (!isValid) {
      console.error("Validation Errors: ", errors);
      return;
    }
    if (editIndex !== null) {
      const updatedItems = [...rows];
      updatedItems[editIndex] = currentProduct;
      setRows(updatedItems);
    } else {
      setRows([...rows, currentProduct]);
    }
    setAddItemFormOpen(false);
    resetItemFormState();
  };
  const handleAddPaymentSave = () => {
    let isValid = true;
    if (!validateItemForm(addpaymentItem, setItemError, currentPayment)) {
      isValid = false;
      console.log(addpaymentItem, currentPayment, "adding data");
    }
    if (!isValid) {
      console.error("Validation Errors: ", errors);
      return;
    }
    const selectedPaytype =
      paytype.find((pt) => pt.value === currentPayment.paytype) || null;
    const formattedProduct = {
      ...currentPayment,
      paytype:
        selectedPaytype?.label ||
        currentPayment.paytype?.value ||
        currentPayment?.paytype,
      account:
        currentPayment.account?.value ||
        currentPayment?.account ||
        currentPayment?.account?.label,
      currency: currentPayment.currency?.label,
    };
    if (editIndex !== null) {
      const updatedItems = [...payrows];
      updatedItems[editIndex] = formattedProduct;
      setPayRows(updatedItems);
    } else {
      setPayRows([...payrows, formattedProduct]);
    }
    setAddPaymentFormOpen(false);
    resetItemFormState();
  };

  const handlepaymentEdit = (index) => {
    console.log(payrows, "editrows");
    const productToEdit = payrows[index];

    const match = paytype.find((pt) => pt.label === productToEdit.paytype);
    console.log(match, "match");
    setCurrentPayment({
      ...productToEdit,
      paytype: match?.value || null,
      currency: { label: productToEdit.currency },
    });
    setEditIndex(index);
    setAddPaymentFormOpen(true);
    console.log("Edit item:", payrows[index]);
  };
  useEffect(() => {
    if (partyList?.dtParty?.length > 0) {
      setFilteredPartyItems(partyList.dtParty);
    }
  }, [partyList]);

  const handleItemFormChange = (e) => {
    let fieldName = e.target.name;
    let fieldValue = e.target.value;

    const updatedRow = { ...currentProduct, [fieldName]: fieldValue };

    const grossWt = parseFloat(updatedRow.grossWt || 0);
    let deductionWt = parseFloat(updatedRow.deductionWt || 0);
    let deductionPrcnt = parseFloat(updatedRow.deductionPrcnt || 0);

    // Handle deduction calculations
    if (fieldName === "deductionPrcnt") {
      deductionWt = (grossWt * deductionPrcnt) / 100;
      updatedRow.deductionWt = deductionWt.toFixed(2);
    } else if (fieldName === "deductionWt") {
      deductionPrcnt = grossWt > 0 ? (deductionWt / grossWt) * 100 : 0;
      updatedRow.deductionPrcnt = deductionPrcnt.toFixed(2);
    }

    // Update net weight
    updatedRow.netWt = (grossWt - deductionWt).toFixed(3);

    // Handle other calculations
    if (
      [
        "grossWt",
        "stoneWt",
        "goldPrice",
        "stoneAmount",
        "mcPerGm",
        "qty",
      ].includes(fieldName) ||
      [
        "pureWeight",
        "goldPrice",
        "qty",
        "deductionWt",
        "deductionPrcnt",
      ].includes(fieldName)
    ) {
      updatedRow.pureWeight = calculatePureWeight({
        netWt: updatedRow.netWt,
        purity: updatedRow.purity,
        digits: 3,
      });

      updatedRow.amount = calculateGoldRetaildedAmount({
        price: updatedRow.price,
        qty: updatedRow.qty,
        // netWt: updatedRow.netWt,
        grossWt: updatedRow.grossWt,
        deductionWt: updatedRow.deductionWt,
        digits: 3,
      });
    }

    setCurrentProduct(updatedRow);
    setItemError((prev) => ({ ...prev, [fieldName]: "" }));
  };
  const handlepaymentFormChange = (e) => {
    const fieldName = e.target.name;
    const value = e.target.value;

    const updatedRow = { ...currentPayment, [fieldName]: value };
    console.log(currentPayment, fieldName, "formDatachange");
    // Calculate amountFc whenever amountLc or exRate changes
    if (fieldName === "amountLC" || fieldName === "exchangerate") {
      const amountLC = parseFloat(updatedRow.amountLC || 0);
      const exchangerate = parseFloat(updatedRow.exchangerate || 0);
      updatedRow.amountFC = parseFloat((amountLC * exchangerate).toFixed(3));
    }

    setCurrentPayment(updatedRow);
    setItemError((prev) => ({ ...prev, [fieldName]: "" }));
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

  const updatePartyList =
    partyList &&
    partyList?.dtParty?.map((option) => ({
      label: option.CurName,
      value: option.CurId,
    }));
  // console.log(partyList, "partylist");
  const partyOptions = useMemo(() => {
    return filteredPartyItems?.map((option) => ({
      label: option?.Prt_Id,
      value: option?.Prt_Id,
    }));
  }, [filteredPartyItems]);
  const handleFilterParty = (searchText) => {
    if (!searchText) {
      setFilteredPartyItems(partyList && partyList?.dtParty);
    } else {
      const filteredId = partyList?.dtParty.filter((item) =>
        item.Prt_Id?.toLowerCase().includes(searchText.toLowerCase()),
      );
      const filteredName = partyList?.dtParty.filter((item) =>
        item.Prt_Name.toLowerCase().includes(searchText.toLowerCase()),
      );
      console.log(searchText, filteredId, "filter tesxt");
      setFilteredPartyItems(filteredId);
      setFilteredPartyItems(filteredName);
    }
  };

  return (
    <>
      <div className="main-section">
        <MainHeading
          heading={`Gold Receipt Voucher Invoice${
            formData.supplierRef && !isNaN(parseInt(formData.supplierRef))
              ? ` - ${parseInt(formData.supplierRef)}`
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
            {/* <Typography sx={{ textAlign: "left" }} component={"h3"}>
              Gold Retail Sales Invoice
            </Typography> */}

            <CustomerInputForm
              data={comboBox}
              formData={formData}
              errors={errors}
              onFormChange={handleFormChange}
              partylist={partyList}
              callFilterAction={handleFilterParty}
              options={partyOptions}
              filteredPartyItems={filteredPartyItems}
              type="GR"
            />
          </Box>

          <Divider sx={{ mt: 0 }} />
          {(receiptVoucherloading || partyloading || partyLoading) && (
            <Loader />
          )}
          <Box sx={{ p: 2 }}>
            <ItemViewTable
              rows={rows}
              columns={itemTableColumns}
              onEdit={handleEdit}
              onDelete={handleItemDelete}
            />
            <AddItemForm
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
              fields={addItemFormFields}
              loading={itemloading}
              errors={itemError}
              setErrors={setItemError}
              currentItemEdit={editIndex}
            />
            <Grid size={{ xs: 12, md: 12, lg: 12 }}></Grid>
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
                  text="Add Item"
                  // theme={theme}
                  sx={{ mt: 2 }}
                  variantType="dark"
                  type="submit"
                  disabled={itemloading}
                  loading={itemloading}
                  // startIcon={<AddIcon />}
                />
              </Grid>
            </Grid>
            <Typography className="Mui-error text-error" component={"p"}>
              {rows.length <= 0 && errors?.general && errors.general}
            </Typography>
            <Grid container spacing={2} sx={{ flexGrow: 1, p: 1 }}>
              <Grid
                size={{ xs: 12, md: 6, lg: 6 }}
                sx={{ display: "flex", mt: 5 }}
              >
                <CustomInput label="Total" value={totalWeight} sx={{ mr: 2 }} />
              </Grid>
              <Grid
                size={{ xs: 12, md: 6, lg: 6 }}
                sx={{ display: "flex", mt: 5 }}
              >
                <CustomInput label="Stock" value={totalPureWeight} />
              </Grid>
            </Grid>

            {/* <Grid
              // className="invoice-table-payment-section-main"
              // container
              // spacing={3}
              sx={{ flexGrow: 1, mt: 5 }}
            > */}
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <ItemViewTable
                rows={payrows}
                columns={paymentTableColumns}
                onEdit={handlepaymentEdit}
                onDelete={handlePayDelete}
                type={"payment"}
              />
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
                rows={payrows}
                setRows={setPayRows}
                modalOpen={addPaymentFormOpen}
                setModalOpen={setAddPaymentFormOpen}
                formData={currentPayment}
                // fetchProductDetails={getItemDetails}
                setFormData={setCurrentPayment}
                // options={options}
                resetState={resetItemFormState}
                handleSubmit={handleAddPaymentSave}
                onFormChange={handlepaymentFormChange}
                fields={addpaymentItem}
                loading={itemloading}
                errors={itemError}
                setErrors={setItemError}
                currentItemEdit={editIndex}
                CompanyDetails={CompanyDetails}
              />
            </Grid>
            <Grid container spacing={2}>
              <Grid
                size={{ xs: 12, md: 12, lg: 12 }}
                sx={{ mt: 2, textAlign: "left" }}
              >
                <CustomButton
                  onClick={() => {
                    setAddPaymentFormOpen(true);
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
                size={{ xs: 12, md: 6, lg: 6 }}
                offset={{ xs: 0, md: 1, lg: 1 }}
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
                  type={"GR"}
                />
              </Grid>
            </Grid>
          </Box>

          <FooterButtonsGroup
            isEdit={isEdit}
            isSaving={grSaving}
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
            type={"GR"}
            handleList={() => handleList("GR")}
            handleDelete={handleItemDelete}
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
            handleConfirm={
              type == "payment"
                ? handlePayDeleteConfirm
                : handleItemDeleteConfirm
            }
          />
        </Paper>
      </div>
    </>
  );
};
const mapStateToProps = ({ auth = {}, demo = {}, invoice = {} }) => ({
  comboBox: _.get(auth, "comboBox", []),
  itemData: _.get(demo, "itemData", []),
  partyData: _.get(demo, "partyData", []),
  companyBranchlist: _.get(auth, "companyBranchList", []),
  CompanyDetails: _.get(auth, "CompanyDetails", []),
  createLoading: _.get(auth, "invoiceloading", false),
  itemloading: _.get(demo, "itemloading", false),
  partyloading: _.get(demo, "partyloading", false),
  partyLoading: _.get(demo, "partyLoading", false),

  currencyList: _.get(demo, "currencyList", []),
  receiptVoucherloading: _.get(invoice, "receiptVoucherloading", false),
  receiptVoucherData: _.get(invoice, "receiptVoucherData", {}),
  partyList: _.get(demo, "partyList", []),
  authData: _.get(auth, "authData", {}),
});

const mapDispatchToProps = (dispatch) => ({
  getItemInformation: (data) =>
    dispatch({ type: "getItemInformationcalled", payload: data }),
  getPartyInformation: (data) =>
    dispatch({ type: "getPartyInformationcalled", payload: data }),
  saveRecieptVoucherInvoice: (data) =>
    dispatch({ type: "saveRecieptVoucherInvoicecalled", payload: data }),
  getParty: (data) => dispatch({ type: "getPartycalled", payload: data }),
  getCurrency: (data) => dispatch({ type: "getCurrencycalled", payload: data }),
  clearPartyData: () => dispatch(clearData()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GoldReceiptVoucher);
