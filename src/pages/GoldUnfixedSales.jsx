import React, { useEffect, useState, useCallback } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { connect, useDispatch, useSelector } from "react-redux";
import CustomerDetailsForm from "../components/GoldComponents/CustomerDetailsForm";
import Grid from "@mui/material/Grid2";
import Loader from "../components/Loader/Loader";
import {
  calculateGoldRetailPricePerGm,
  calculateGoldRetailAmount,
  calculateGoldRetailPerGram,
  calculateGoldRetailPrice,
  calculateGoldRetailPerPcs,
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
import PaymentBreakdownTable from "../components/Common/PaymentBreakdownTable";
import formatDateToISOString from "../utilities/formatDateToISOString";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import * as salesApi from "../services/salesInvoiceApi";
import * as unfixedSalesApi from "../services/unfixedSalesApi";
import { sessionRefreshed } from "../features/auth/authSlice";
import dayjs from "dayjs";
import MainHeading from "../components/Common/MainHeading";
import CustomButton from "../components/Customcomponents/CustomButton";
import AddItemForm from "../components/GoldComponents/AddItemForm";
import ItemViewTable from "../components/GoldComponents/ItemViewTable";
import {
  itemTableColumns,
  addItemFormFields,
  customerDetailsRequiredFields,
} from "../constants/UnfixedPurchaseConstant";
import { clearData } from "../features/demo/demoSlice";
import {
  validateForm,
  validateTableRowsData,
  validateItemForm,
} from "../utilities/Validator/FormValidators";
import Popup from "../components/Customcomponents/Popup";
// const initialRow = {
//   id: Date.now().toString(),
//   itemCode: "",
//   description: "",
//   purity: "",
//   qty: 1,
//   grossWt: "0",
//   stoneWt: "0",
//   netWt: "0",
//   // goldPrice: "0",
//   pureWt: "",
//   mcPerGm: "0",
//   // stoneValue: "0",
//   // unitPricePerGm: "0",
//   stoneAmount: "0",
//   // price: "0",
//   amount: "0",
//   pureWeight: "0",
// };

const GoldUnfixedSales = ({
  comboBox,
  getItemInformation,
  itemData,
  companyBranchlist,
  CompanyDetails,

  createLoading,
  itemloading,
  saveUnfixedSaleInvoice,
  getPartyInformation,
  UnfixedPurchaseData,
  UnfixedPurchaseloading,
  partyData,
  clearPartyData,
  partyloading,
  authData,
}) => {
  const { state } = useLocation();

  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const matrixAuth = useSelector((store) => store.auth || {});
  const session = { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey };
  const refreshSession = (tokens) => dispatch(sessionRefreshed(tokens));
  const { id: routeTransactionNo } = useParams();
  const [itemOptions, setItemOptions] = useState([]);
  const [customerRows, setCustomerRows] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  const initialItemFormData = addItemFormFields.reduce((acc, field) => {
    acc[field.key] = field.type === "number" ? 0 : "";
    return acc;
  }, {});
  const [currentProduct, setCurrentProduct] = useState(initialItemFormData);
  const [addItemFormOpen, setAddItemFormOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [appMessagePopup, setAppMessagePopup] = useState({ show: false, message: "" });
  const showAppMessage = (message) => setAppMessagePopup({ show: true, message });
  const [isEdit, setIsEdit] = useState(false);
  const [itemError, setItemError] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [isbarCodeValid, setIsbarCodeValid] = useState(false);
  const [rows, setRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);

  const [currentItem, setCurrentItem] = useState({});

  const [formData, setFormData] = useState({
    location: "",
    invoiceNo: "",
    date: dayjs(),
    refNo: "",
    // salesman: "",
    supplier: "",
    civilId: "",
    mobile: "",
    // customerPhone: "",
    phone: "",
    supplierInvoice: "",
    contactPerson: "",
    companyCRNO: "",
    creditDays: "",
    // customerName: "",
    nationality: "",
    // area: "",
    supplierName: "",
    pureGoldPurity: 999,
  });

  const calculateUsalPureWeight = (netWt, purity) => {
    const customerPurity = Number(formData.pureGoldPurity || 999);
    if (!customerPurity) return 0;
    return Number(((Number(netWt || 0) * Number(purity || 0)) / customerPurity).toFixed(3));
  };

  const [errors, setErrors] = useState({});
  const [dataReady, setDataReady] = useState(false);
  useEffect(() => {
    return () => {
      clearPartyData();
    };
  }, []);

  const applyItemResponse = (item) => {
    if (!item) return;
    const grossWt=Number(item.grossWeight||0), stoneWt=Number(item.stoneWeight||0), goldPrice=Number(item.salePrice||0);
    const netWt=Math.max(0,grossWt-stoneWt), mc=Number(item.makingCharge||item.makingCost||0), stoneAmount=Number(item.stoneAmount||0);
    // Legacy/API rule: only Prod_BarcodeFlag = 1 is a barcode-controlled item.
    // A barcode string by itself must not lock manual transaction fields.
    const isBarcodeControlled = Number(item.barcodeFlag || 0) === 1;
    setIsbarCodeValid(isBarcodeControlled);
    setCurrentProduct((prev)=>({ ...prev, itemCode:{value:item.itemId,label:item.itemName||item.itemId}, barcode:isBarcodeControlled ? (item.barcode || "") : "", description:item.itemName||"", purity:Number(item.goldPurity||0), qty:1, grossWt:isBarcodeControlled ? grossWt : 0, stoneWt:isBarcodeControlled ? stoneWt : 0, netWt:isBarcodeControlled ? netWt : 0, goldPrice, mcPerGm:mc, stoneAmount, pureWeight:isBarcodeControlled ? calculateUsalPureWeight(netWt, Number(item.goldPurity||0)) : 0 }));
    setItemError({});
  };
  const getItemDetails = async (selectedId) => {
    if(!selectedId) return;
    try { applyItemResponse(await salesApi.scanItem({itemCode:selectedId,session,onSessionRefreshed:refreshSession})); }
    catch(e){ setItemError((prev)=>({...prev,itemCode:e.message||"Unable to retrieve item."})); }
  };
  const searchItemOptions = useCallback(async (term) => {
    const value=String(term||"").trim(); if(value.length<2){setItemOptions([]);return;}
    try { const result=await salesApi.searchItems({term:value,session,onSessionRefreshed:refreshSession}); setItemOptions((result||[]).map(x=>({value:x.itemId,label:x.itemName||x.itemId}))); } catch { setItemOptions([]); }
  },[matrixAuth.accessToken,matrixAuth.refreshToken,matrixAuth.tenantKey]);
  const options = itemOptions;
  const screenComboBox = { ...(comboBox||{}), supplier:customerRows.map(x=>({fldID:x.partyId||x.customerId,fldDisplay:`${x.partyId||x.customerId} ${x.name||x.partyName||x.customerName||""}`.trim()})) };

  // useEffect(() => {
  //   if (itemData && itemData.ItmCode) {
  //     const isItembarCodeValid =
  //       itemData.ItmBarCode !== null &&
  //       itemData.ItmBarCode !== "" &&
  //       itemData.ItmBarCode !== "0" &&
  //       itemData.ItmBarCode !== 0;

  //     const grossWt = isItembarCodeValid
  //       ? parseFloat(itemData.ItmStockAll) || 0
  //       : 0;
  //     const stoneAmount =
  //       itemData.TranStoneAmt === null ||
  //       itemData.TranStoneAmt === "" ||
  //       itemData.TranStoneAmt === undefined
  //         ? 0
  //         : parseFloat(itemData.TranStoneAmt);
  //     const updatedProductDetails = {
  //       ...currentProduct,
  //       description: itemData.ItmName || "",
  //       purity: itemData.ItmGoldPurityNo || "",
  //       qty: parseFloat(itemData.TranItmGoldAmt) || 1,
  //       grossWt: grossWt,
  //       stoneWt: parseFloat(itemData.ItmStoneWeight) || 0,
  //       goldPrice: parseFloat(itemData.ItmSalePrice) || 10,
  //       mcPerGm: parseFloat(itemData.ItmMcCostType) || 0,
  //       stoneAmount: stoneAmount,
  //     };
  //     updatedProductDetails.pureWeight = calculatePureWeight({
  //       netWt: updatedProductDetails.netWt,
  //       purity: updatedProductDetails.purity,

  //       digits: 3,
  //     });
  //     updatedProductDetails.netWt =
  //       updatedProductDetails.grossWt - updatedProductDetails.stoneWt;
  //     // updatedProductDetails.unitPricePerGm = calculateGoldRetailPricePerGm({
  //     //   grossWgt: updatedProductDetails.grossWt,
  //     //   stoneWgt: updatedProductDetails.stoneWt,
  //     //   goldPrice: updatedProductDetails.goldPrice,
  //     //   stoneAmount: updatedProductDetails.stoneAmount,
  //     //   mcgm: updatedProductDetails.mcPerGm,
  //     //   digits: 3,
  //     // });
  //     updatedProductDetails.price = calculateGoldRetailPrice({
  //       grossWgt: updatedProductDetails.grossWt,
  //       stoneWgt: updatedProductDetails.stoneWt,
  //       goldPrice: updatedProductDetails.goldPrice,
  //       stoneAmount: updatedProductDetails.stoneAmount,
  //       mcgm: updatedProductDetails.mcPerGm,
  //       digits: 3,
  //     });
  //     updatedProductDetails.amount = calculateGoldRetailAmount({
  //       price: updatedProductDetails.price,
  //       qty: updatedProductDetails.qty,
  //       digits: 3,
  //     });

  //     setCurrentProduct({ ...currentProduct, ...updatedProductDetails });
  //     setItemError({});
  //   }
  // }, [itemData]);
  useEffect(() => {
    if (itemData && itemData[0]?.Prod_Id) {
      const isItembarCodeValid =
        itemData[0]?.Prod_BarcodeFlag !== null &&
        itemData[0]?.Prod_BarcodeFlag !== "" &&
        itemData[0]?.Prod_BarcodeFlag !== "0" &&
        itemData[0]?.Prod_BarcodeFlag !== 0;
      setIsbarCodeValid(isItembarCodeValid);
      // console.log(isItembarCodeValid, "isitemcode value");
      const grossWt = isItembarCodeValid
        ? parseFloat(itemData[0]?.Prod_GWeight) || 0
        : 0;
      const stoneAmount =
        !isItembarCodeValid ||
        itemData[0]?.TranStoneAmt === null ||
        itemData[0]?.TranStoneAmt === "" ||
        itemData[0]?.TranStoneAmt === undefined
          ? 0
          : parseFloat(itemData[0]?.TranStoneAmt);

      const updatedProductDetails = {
        ...currentProduct,
        description: itemData[0]?.Prod_Name || "",
        purity: itemData[0]?.Prod_GoldPurity || "",
        qty: parseFloat(itemData[0]?.TranItmGoldAmt) || 1,
        grossWt: grossWt,
        stoneWt: parseFloat(itemData[0]?.Prod_SWeight) || 0,
        goldPrice: parseFloat(itemData[0]?.ItmSalePrice) || 0,
        mcPerGm: parseFloat(itemData[0]?.Prod_SalePrice) || 0,
        stoneAmount: stoneAmount,
      };
      updatedProductDetails.netWt =
        updatedProductDetails.grossWt - updatedProductDetails.stoneWt;
      updatedProductDetails.unitPricePerGm = calculateGoldRetailPricePerGm({
        grossWgt: updatedProductDetails.grossWt,
        stoneWgt: updatedProductDetails.stoneWt,
        goldPrice: updatedProductDetails.goldPrice,
        stoneAmount: updatedProductDetails.stoneAmount,
        mcgm: updatedProductDetails.mcPerGm,
        digits: 3,
      });
      updatedProductDetails.price = calculateGoldRetailPrice({
        grossWgt: updatedProductDetails.grossWt,
        stoneWgt: updatedProductDetails.stoneWt,
        goldPrice: updatedProductDetails.goldPrice,
        stoneAmount: updatedProductDetails.stoneAmount,
        mcgm: updatedProductDetails.mcPerGm,
        digits: 3,
      });
      console.log(
        updatedProductDetails.netWt,
        updatedProductDetails.purity,
        "itemData",
      );
      updatedProductDetails.pureWeight = calculateUsalPureWeight(updatedProductDetails.netWt, updatedProductDetails.purity);
      updatedProductDetails.amount = calculateGoldRetailAmount({
        price: updatedProductDetails.price,
        qty: updatedProductDetails.qty,
        digits: 3,
      });

      setCurrentProduct({ ...currentProduct, ...updatedProductDetails });
      setItemError({});
    }
  }, [itemData]);
  useEffect(() => {
    console.log(isbarCodeValid, "Updated isbarCodeValid");
  }, [isbarCodeValid]);
  const getPartyDetails = async (selectedId) => {
    if(!selectedId) return;
    try {
      const p=await unfixedSalesApi.getCustomer({customerId:selectedId,session,onSessionRefreshed:refreshSession});
      setFormData((prev)=>({...prev,supplier:p.partyId||p.customerId||selectedId,supplierName:p.name||p.partyName||p.customerName||"",civilId:p.civilId||"",mobile:p.phone||"",customerPhone:p.phone||"",phone:p.phone||"",contactPerson:p.contactPerson||"",companyCRNO:p.crNo||"",creditDays:p.creditDays||0,nationality:p.country||p.countryId||"",pureGoldPurity:Number(p.pureGoldPurity||p.goldPurity||999)}));
    } catch(e){ showAppMessage(e.message||"Unable to load supplier details."); }
  };

  const handleFormChange = (fieldName, value) => {
    if (fieldName === "supplier") {
      getPartyDetails(value);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };
  useEffect(() => {
    const party =
      Array.isArray(partyData?.dtParty) && partyData?.dtParty.length > 0
        ? partyData?.dtParty[0]
        : null;
    if (false && party) {
      const crNo = partyData?.dtParty[0]?.Prt_CrNo;

      setFormData((prev) => ({
        ...prev,
        civilId: party?.Prt_CivilId || "",
        companyCRNo: crNo || "",
        contactPerson: party?.Prt_Person || "",
        party: party?.Prt_Id || "",
        supplier: party?.Prt_Id || "",
        supplierName: party?.Prt_Name || "",
        phone: party?.Prt_Phone || "",
        customerPhone: party?.Prt_Phone || "",
        amount: party?.BalaceAmount?.toString() || "",
        gold: party?.BalanceGold?.toString() || "",
        mobile: party?.Prt_Phone || "",
        creditDays: party?.Prt_CreditDays || 0,
      }));
    } else if (false) {
      setFormData({
        location: "",
        invoiceNo: "",
        date: dayjs(),
        refNo: "",
        // salesman: "",
        supplier: "",
        civilId: "",
        mobile: "",
        supplierName: "",
    pureGoldPurity: 999,
        // customerPhone: "",
        phone: "",
        supplierInvoice: "",
        contactPerson: "",
        companyCRNO: "",
        creditDays: "",
        // customerName: "",
        nationality: "",
        // area: "",
      });
    }
  }, [partyData]);

  useEffect(() => {
    if(!session.accessToken || !session.tenantKey) return;
    let alive=true; setApiLoading(true);
    Promise.all([unfixedSalesApi.searchCustomers({term:"",take:150,session,onSessionRefreshed:refreshSession}), routeTransactionNo ? unfixedSalesApi.getUnfixedSale({transactionNo:routeTransactionNo,session,onSessionRefreshed:refreshSession}) : Promise.resolve(null)])
      .then(async ([suppliers,doc])=>{ if(!alive)return; setCustomerRows(Array.isArray(suppliers)?suppliers:[]); if(!doc)return; const h=doc.header||{}; setIsEdit(true); setFormData((prev)=>({...prev,invoiceNo:h.transactionNo||"",date:h.invoiceDate?dayjs(h.invoiceDate):dayjs(),refNo:h.referenceNo||"",supplier:h.customerId||h.partyId||h.supplierId||"",supplierName:h.customerName||h.partyName||h.supplierName||"",civilId:h.customerCivilId||h.partyCivilId||h.supplierCivilId||"",mobile:h.customerMobile||h.customerPhone||h.partyMobile||h.partyPhone||h.supplierMobile||h.customerPhone||h.partyPhone||h.supplierPhone||"",customerPhone:h.customerPhone||h.partyPhone||h.supplierPhone||"",phone:h.customerPhone||h.partyPhone||h.supplierPhone||"",companyCRNO:h.customerCrNo||h.partyCrNo||h.supplierCrNo||"",contactPerson:h.contactPerson||"",nationality:h.nationality||"",creditDays:h.creditDays||0,pureGoldPurity:Number(h.pureGoldPurity||999)})); setRows((doc.items||[]).map(x=>({id:x.lineNo,itemCode:{value:x.itemId,label:x.description||x.itemId},description:x.description||"",purity:x.purity||0,qty:x.quantity||1,grossWt:x.goldWeight||0,stoneWt:x.stoneWeight||0,netWt:x.netWeight||0,pureWeight:x.pureWeight||0,mcPerGm:x.makingRate||0,stoneAmount:x.stoneAmount||0,amount:x.amount||0,unfixedAmount:x.unfixedAmount||0}))); setDiscount(Number(h.discountAmount||0)); setRemarks(h.remarks||""); setPaymentRows((doc.payments||[]).map(x=>({ payType:{ value:x.paymentTypeId, label:(comboBox?.paytype||[]).find(p=>String(p.fldID)===String(x.paymentTypeId))?.fldDisplay||x.paymentTypeId }, amount:Number(x.amount||0), exchangerate:Number(x.exchangeRate||1), currencyId:x.currencyId||"", currencyAmount:Number(x.currencyAmount||0) }))); })
      .catch(e=>{if(alive)showAppMessage(e.message||"Unable to load unfixed sale data.");}).finally(()=>{if(alive)setApiLoading(false);});
    return()=>{alive=false;};
  },[routeTransactionNo,matrixAuth.accessToken,matrixAuth.refreshToken,matrixAuth.tenantKey]);

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
          ProdGoldRate: item.goldPrice || "0.000",
          ProdMcRate: item.mcgm || "0.000",
          ProdRate: item.unitPricePerGm || "0.000",
          ProdAmount: item.amount || "0.000",
          ProdBarcode: item.itemCode.value || "",
          ProdName: item.description,
          // ProdGoldPureWgt: "0.00",
          ProdTaxPer: "0",
          ProdMcAmount: item?.mcPerGm || "0.00",
          ProdGoldAmount: "0.00",
          ProdDedPer: "0.00",
          ProdDedWgt: "0.00",
          ProdRepairFlag: "1",
          ProdRepairWgt: "0",
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
      newData = {
        TranFinYear: CompanyDetails[0].FinancialYear,
        // TranLocId: parseName(locations, props.companyLocation),
        TranLocId: data?.location || "1",
        TranCompanyId: authData?.companyId || "1",
        TranType: "UGLP",
        TranNo: parseInt(data.invoiceNo) || 0,
        TranDate: formatDateToISOString(data.date),
        TranPrtName: data.supplier,
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
        TranGoldRate: "200",

        TranScrapAmt: "0.000",
        TranRemark1: data.remarks || "",
        TranSysUser: "001",
        TranCreditDays: data.creditDays || "0",
        TranDiscAmt: data.discount || "0",
        TranNetAmt: data.netAmount || "0",
        TranPrtCrNo: data.companyCRNO || "",
        TranPrtId: data.supplier || "",
        TranPrtPerson: data.contactPerson || "",
        TranTotalAmt: "0",
        TranVrNo: data.supplierInvoice,
      };

      return newData;
    }
    return newData;
  }

  // function formatedPaymentBreakdown(data) {
  //   const strPaymentTable = data.map((item, index) => {
  //     return {
  //       PaySrNo: index + 1,
  //       PayId: item.payType?.label,
  //       PayAmt: item.amount.toString() || "0.000",
  //       PayCurId: item.payType?.value,
  //       PayCurExRate: "1",
  //       PayCurAmt: "1",
  //       PayChqNo: "123",
  //       PayActNo: "123",
  //       PayChqDate: "",
  //     };
  //   });
  //   return strPaymentTable;
  // }

  // const handleSubmit = () => {
  //   let isValid = true;
  //   const updatedErrors = { itemDetails: {} };

  //   rows.forEach((row, index) => {
  //     const rowErrors = validateTableRowsData(
  //       itemDetailsTableRequiredFields,
  //       row
  //     );
  //     if (Object.keys(rowErrors).length > 0) {
  //       isValid = false;
  //       updatedErrors.itemDetails[index] = rowErrors;
  //     }
  //   });

  //   if (!validateForm(customerDetailsRequiredFields, setErrors, formData))
  //     isValid = false;
  //   if (!isValid) {
  //     setErrors((prev) => ({ ...prev, ...updatedErrors }));
  //     console.error("Validation Errors: ", updatedErrors);
  //     // showAppMessage("Please fix the errors in the table and form before submitting.");
  //     return;
  //   }

  //   setErrors({ itemDetails: {} });

  //   const strTransactionTable = formatedItemData(rows);
  //   console.log("CompanyDetails", CompanyDetails);

  //   const strClsInventory = formatedCusDetails(formData);

  //   // const strPaymentTable = formatedPaymentBreakdown(paymentRows);

  //   let newData = {
  //     strTransactionTable,
  //     strClsInventory,
  //     // strPaymentTable,
  //   };
  //   saveUnfixedSaleInvoice(newData);
  //   console.log("Submitting Data: ", newData);
  //   // showAppMessage("Form submitted successfully!");
  // };
  const numberString = Object.keys(UnfixedPurchaseData)
    .filter((key) => !isNaN(key)) // only numeric keys
    .sort((a, b) => a - b) // sort keys numerically
    .map((key) => UnfixedPurchaseData[key]) // get values
    .join(""); // join into one string

  const finalNumber = parseInt(numberString, 10);
  useEffect(() => {
    if (formSaved && UnfixedPurchaseData) {
      setFormData((prevState) => ({
        ...prevState,
        invoiceNo: finalNumber,
      }));
    }
  }, [formSaved, UnfixedPurchaseData]);
  const handleSubmit = () => {
    try {
      let isValid = true;
      const updatedErrors = { itemDetails: {} };
      if (!validateForm(customerDetailsRequiredFields, setErrors, formData)) {
        isValid = false;
      }
      console.log(formData, "formData");
      if (rows.length < 1) {
        setErrors((prev) => ({
          ...prev,
          general: "Please add at least one item.",
        }));
        console.warn("Validation Failed: No items added.");
        return;
      }

      rows.forEach((row, index) => {
        const rowErrors = validateTableRowsData(addItemFormFields, row);
        if (Object.keys(rowErrors).length > 0) {
          isValid = false;
          updatedErrors.itemDetails[index] = rowErrors;
        }
      });

      // if (!isValid) {
      //   setErrors((prev) => ({ ...prev, ...updatedErrors }));
      //   console.error("Validation Errors:", updatedErrors);
      //   return;
      // }

      setErrors({ itemDetails: {} });

      const strTransactionTable = formatedItemData(rows);
      const strClsInventory = formatedCusDetails(formData);
      // const strPaymentTable = formatedPaymentBreakdown(paymentRows);

      const newData = {
        strTransactionTable,
        strClsInventory,
        // strPaymentTable,
      };

      const baseCurrency = comboBox?.currency?.[0];
      const currencyId = String(baseCurrency?.fldID || "001");
      const exchangeRate = Number(baseCurrency?.rate || 1);
      const request = {
        header: { transactionDate: formatDateToISOString(formData.date), partyId:String(formData.supplier||""), partyName:formData.supplierName||"", referenceNo:formData.refNo||"", voucherNo:formData.supplierInvoice||"", remarks, invoiceType:1, discountPercentage:0, discountAmount:Number(discount||0), taxAmount:0, netAmount:Number(netAmount||0), goldRate:0, pureGoldPurity:Number(formData.pureGoldPurity||999), creditDays:Number(formData.creditDays||0), currencyId, exchangeRate },
        items: rows.map((x,i)=>({ lineNo:i+1,itemId:x.itemCode?.value||x.itemCode||"",barcode:x.barcode||"",itemDescription:x.description||"",makingCost:0,goldPurity:Number(x.purity||0),quantity:Number(x.qty||1),goldWeight:Number(x.grossWt||0),stoneWeight:Number(x.stoneWt||0),goldNetWeight:Number(x.netWt||0),goldPureWeight:Number(x.pureWeight||0),makingRate:Number(x.mcPerGm||0),stoneAmount:Number(x.stoneAmount||0),makingAmount:Number(x.mcPerGm||0),amount:Number(x.amount||0),unfixedAmount:Number(x.unfixedAmount||x.amount||0),makingTypeId:Number(x.mcType||0) })),
        payments: paymentRows.map((x,i)=>({ lineNo:i+1, paymentTypeId:String(x?.payType?.value||x?.payType||""), amount:Number(x.amount||0), currencyId:String(x.currencyId||currencyId), exchangeRate:Number(x.exchangerate||exchangeRate||1), currencyAmount:Number(x.currencyAmount||x.amount||0) }))
      };
      setApiLoading(true);
      unfixedSalesApi.saveUnfixedSale({request,session,onSessionRefreshed:refreshSession}).then((result)=>{ setFormSaved(true); setFormData(prev=>({...prev,invoiceNo:result.transactionNo||prev.invoiceNo})); showAppMessage(result.posted ? `Unfixed Sale Invoice ${result.transactionNo} saved and posted successfully.` : `Unfixed Sale Invoice ${result.transactionNo} saved, but posting requires attention. ${result.message||""}`); }).catch((e)=>showAppMessage(e.message||"Unable to save Unfixed Sale Invoice.")).finally(()=>setApiLoading(false));
    } catch (error) {
      console.error("Error during form submission:", error);
      showAppMessage("An unexpected error occurred. Please try again later.");
    }
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

  // const handleItemFormChange = (e) => {
  //   let fieldName = e.target.name;
  //   const value = e.target.value;

  //   const finalValue =
  //     ["stoneAmount", "stoneWt"].includes(fieldName) &&
  //     (value === "" || value === null)
  //       ? 0
  //       : value;

  //   console.log(finalValue, "finalvalue");

  //   const updatedRow = { ...currentProduct, [fieldName]: finalValue };
  //   updatedRow.netWt =
  //     parseFloat(updatedRow.grossWt || 0) - parseFloat(updatedRow.stoneWt || 0);
  //   if (
  //     [
  //       "grossWt",
  //       "stoneWt",
  //       "goldPrice",
  //       "stoneAmount",
  //       "mcPerGm",
  //       "qty",
  //     ].includes(fieldName) ||
  //     ["pureWeight", "goldPrice", "qty"].includes(fieldName)
  //   ) {
  //     {
  //       updatedRow.unitPricePerGm = calculateGoldRetailPricePerGm({
  //         grossWgt: updatedRow.grossWt,
  //         stoneWgt: updatedRow.stoneWt,
  //         goldPrice: updatedRow.goldPrice,
  //         stoneAmount: updatedRow.stoneAmount,
  //         mcgm: updatedRow.mcPerGm,
  //         digits: 3,
  //       });
  //     }
  //     {
  //       updatedRow.price = calculateGoldRetailPrice({
  //         grossWgt: updatedRow.grossWt,
  //         stoneWgt: updatedRow.stoneWt,
  //         goldPrice: updatedRow.goldPrice,
  //         stoneAmount: updatedRow.stoneAmount,
  //         mcgm: updatedRow.mcPerGm,
  //         digits: 3,
  //       });
  //     }
  //     if (String(updatedRow.itemType).trim() === "Item/gram") {
  //       updatedRow.amount = Number(Number(updatedRow.price || 0).toFixed(3));
  //     } else {
  //       updatedRow.amount = calculateGoldRetailAmount({
  //         price: updatedRow.price,
  //         qty: qty,
  //         digits: 3,
  //       });
  //     }
  //   }
  //   setCurrentProduct(updatedRow);
  //   setItemError((prev) => ({ ...prev, [fieldName]: "" }));
  // };
  const handleItemFormChange = (e) => {
    const fieldName = e.target.name;
    const rawValue = e.target.value;

    // keep empty-to-0 behavior for stone fields
    const finalValue =
      ["stoneAmount", "stoneWt"].includes(fieldName) &&
      (rawValue === "" || rawValue === null)
        ? 0
        : rawValue;

    const updatedRow = { ...currentProduct, [fieldName]: finalValue };

    const grossWt = parseFloat(updatedRow.grossWt) || 0;
    const stoneWt = parseFloat(updatedRow.stoneWt) || 0;
    const goldPrice = parseFloat(updatedRow.goldPrice) || 0;
    const stoneAmount = parseFloat(updatedRow.stoneAmount) || 0;
    const mcPerGm = parseFloat(updatedRow.mcPerGm) || 0;
    const qty = parseFloat(updatedRow.qty) || 0;
    const purity = parseFloat(updatedRow.purity) || 0;

    // net weight
    updatedRow.netWt = grossWt - stoneWt;
    updatedRow.pureWeight = calculateUsalPureWeight(updatedRow.netWt, purity);

    if (
      [
        "grossWt",
        "stoneWt",
        "goldPrice",
        "stoneAmount",
        "mcPerGm",
        "pureWeight",
        "qty",
        "itemType",
      ].includes(fieldName)
    ) {
      updatedRow.unitPricePerGm = calculateGoldRetailPricePerGm({
        grossWgt: grossWt,
        stoneWgt: stoneWt,
        goldPrice: goldPrice,
        stoneAmount: stoneAmount,
        mcgm: mcPerGm,
        digits: 3,
      });

      updatedRow.price = calculateGoldRetailPrice({
        grossWgt: grossWt,
        stoneWgt: stoneWt,
        goldPrice: goldPrice,
        stoneAmount: stoneAmount,
        mcgm: mcPerGm,
        digits: 3,
      });

      const itemType = String(updatedRow.itemType).trim();

      if (itemType === "perPiece") {
        // multiply by qty
        updatedRow.amount = calculateGoldRetailPerPcs({
          mcgm: mcPerGm,
          qty: qty,
          stoneAmount: stoneAmount,
          digits: 3,
        });
      } else {
        // perGram or any other type: price = amount directly (no qty multiplication)
        updatedRow.amount = calculateGoldRetailPerGram({
          netWt: updatedRow.netWt,
          mcgm: mcPerGm,
          stoneAmount: stoneAmount,
          digits: 3,
        });
      }
    }

    setCurrentProduct(updatedRow);
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

  return (
    <>
      <div className="main-section">
        <MainHeading
          heading={`Unfix Purchase Invoice${
            formData.supplierInvoice &&
            !isNaN(parseInt(formData.supplierInvoice))
              ? ` - ${parseInt(formData.supplierInvoice)}`
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

            <CustomerDetailsForm
              data={screenComboBox}
              formData={formData}
              errors={errors}
              onFormChange={handleFormChange}
              type="USAL"
            />
          </Box>

          <Divider sx={{ mt: 0 }} />
          {(UnfixedPurchaseloading || partyloading || apiLoading) && <Loader />}
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
              isItembarCodeValid={isbarCodeValid}
              callFilterAction={searchItemOptions}
              serverSideSearch={true}
            />
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
                <CustomInput
                  label="Total Weight"
                  value={totalWeight}
                  sx={{ mr: 2 }}
                />
              </Grid>
              <Grid
                size={{ xs: 12, md: 6, lg: 6 }}
                sx={{ display: "flex", mt: 5 }}
              >
                <CustomInput
                  label="Total Pure Weight"
                  value={totalPureWeight}
                />
              </Grid>
            </Grid>
            <Grid
              className="invoice-table-payment-section-main"
              container
              spacing={3}
              sx={{ flexGrow: 1, mt: 5 }}
            >
              <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                <PaymentBreakdownTable
                  paymentRows={paymentRows}
                  setPaymentRows={setPaymentRows}
                  netAmount={netAmount}
                  paymentOptions={comboBox?.paytype}
                  setRemainingBalance={setRemainingAmount}
                  remainingBalance={remainingAmount}
                />
              </Grid>
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
                />
              </Grid>
            </Grid>
          </Box>

          <FooterButtonsGroup
            isEdit={isEdit}
            isSaving={createLoading || apiLoading}
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
            type={"USAL"}
            handleList={() => handleList("USAL")}
            handleDelete={handleItemDelete}
          />
          <Popup
            show={appMessagePopup.show}
            setShow={(show) => setAppMessagePopup((prev) => ({ ...prev, show }))}
            message={appMessagePopup.message}
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
  UnfixedPurchaseloading: _.get(invoice, "UnfixedPurchaseloading", false),
  UnfixedPurchaseData: _.get(invoice, "UnfixedPurchaseData", {}),
  partyData: _.get(demo, "partyData", []),
  partyloading: _.get(demo, "partyloading", false),
  authData: _.get(auth, "authData", {}),
});

const mapDispatchToProps = (dispatch) => ({
  getItemInformation: (data) =>
    dispatch({ type: "getItemInformationcalled", payload: data }),
  saveUnfixedSaleInvoice: (data) =>
    dispatch({ type: "saveUnfixedSaleInvoicecalled", payload: data }),
  getPartyInformation: (data) =>
    dispatch({ type: "getPartyInformationcalled", payload: data }),
  clearPartyData: () => dispatch(clearData()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GoldUnfixedSales);
