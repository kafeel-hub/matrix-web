import React, { useEffect, useState, useRef, useMemo } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { connect } from "react-redux";
import CustomerDetailsForm from "../components/GoldComponents/CustomerDetailsForm";
import Grid from "@mui/material/Grid2";
import Loader from "../components/Loader/Loader";
import InvoicePopup from "../components/Customcomponents/InvoicePopup";
import {
  calculateGoldRetailPricePerGm,
  calculateGoldRetailAmount,
  calculateGoldRetailPrice,
  calculateGoldSalePerGram,
  calculateGoldSalePerPcs,
} from "../utilities/TableCalculations/GoldRetail";
// import {
//   validateForm,
//   validateTableRowsData,
// } from "../utilities/Validator/FormValidators";
import FooterButtonsGroup from "../components/Customcomponents/FooterButtonsGroup";
import NewTable from "../components/CustomTable/NewTable";
import DiscountSection from "../components/GoldComponents/DiscountSection";
import PaymentBreakdownTable from "../components/Common/PaymentBreakdownTable";
import formatDateToISOString from "../utilities/formatDateToISOString";
import moment from "moment";
import MainHeading from "../components/Common/MainHeading";
import {
  formatPaymentDetails,
  formatProductDetails,
} from "../utilities/InvoiceDataFormat";
import {
  validateForm,
  validateTableRowsData,
  validateItemForm,
} from "../utilities/Validator/FormValidators";
import AddItemForm from "../components/GoldComponents/AddItemForm";
import ItemViewTable from "../components/GoldComponents/ItemViewTable";
import {
  itemTableColumns,
  addItemFormFields,
  customerDetailsRequiredFields,
} from "../constants/SalesInvoiceConstant";
import CustomButton from "../components/Customcomponents/CustomButton";
import Popup from "../components/Customcomponents/Popup";
import { clearData } from "../features/invoice/invoiceSlice";
import * as returnApi from "../services/salesReturnApi";
import * as salesApi from "../services/salesInvoiceApi";
import { sessionRefreshed } from "../features/auth/authSlice";
const ReturnInvoice = ({
  comboBox,
  getItemInformation,
  itemData,
  companyBranchlist,
  CompanyDetails,
  getAgainstInvoice,
  createLoading,
  itemloading,
  tableData,
  againstInvoiceData,
  authData,
  returnInvoice,
  returnInvoiceData,
  returnInvoiceloading,
  getTableData,
  againstInvoiceDataloading,
  getInvoiceViaPhn,
  getInvoiceViaCivilId,
  InvoiceDataViaPhn,
  clearPartyData,
  InvoiceDataViaPhnloading,
  session,
  onSessionRefreshed,
}) => {
  const theme = useTheme();
  const { state } = useLocation();
  const [rows, setRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [currentIvoice, setCurrentInvoice] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [validationPopup, setValidationPopup] = useState({
    show: false,
    message: "",
  });
  const columns = [
    { key: "TranDate", label: "Date" },
    { key: "TranPrtName", label: "Name" },
    { key: "TranPrtMobile", label: "Mobile" },
    { key: "TranPrtCivilId", label: "Civil ID" },
  ];
  console.log(againstInvoiceData, CompanyDetails, "againstInvoiceData");

  const [formData, setFormData] = useState({
    location: "",
    invoiceNo: "",
    date: dayjs(),
    refNo: "",
    salesman: "",
    civilId: "",
    mobile: "",
    customerPhone: "",
    customerName: "",
    nationality: "",
    area: "",
    againstInvoice: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const initialItemFormData = addItemFormFields.reduce((acc, field) => {
    acc[field.key] = field.type === "number" ? 0 : "";
    return acc;
  }, {});
  const [currentProduct, setCurrentProduct] = useState(initialItemFormData);
  const [addItemFormOpen, setAddItemFormOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [isbarCodeValid, setIsbarCodeValid] = useState(false);
  const [invoiceCustData, setInvoiceCustData] = useState();
  const [returnApiLoading, setReturnApiLoading] = useState(false);
  const [returnOriginalInvoices, setReturnOriginalInvoices] = useState([]);
  const tranNoList = Array.isArray(returnOriginalInvoices)
    ? returnOriginalInvoices.map((item) => ({ TranNo: item.transactionNo }))
    : [];
  const [originalInvoiceDate, setOriginalInvoiceDate] = useState(null);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemLoadingNew, setItemLoadingNew] = useState(false);

  const [itemError, setItemError] = useState({});

  const [editIndex, setEditIndex] = useState(null);
  const applyItemResponse = (item) => {
    if (!item) return;
    setIsbarCodeValid(Boolean(item.barcode));
    setCurrentProduct((prev) => {
      const grossWt=Number(item.grossWeight || 0), stoneWt=Number(item.stoneWeight || 0), goldPrice=Number(item.salePrice || 0);
      const netWt=Math.max(0,grossWt-stoneWt), mc=Number(item.makingCharge || item.makingCost || 0), stoneAmount=Number(item.stoneAmount || 0);
      const unit=calculateGoldRetailPricePerGm({grossWgt:grossWt,stoneWgt,goldPrice,stoneAmount,mcgm:mc,digits:3});
      const price=calculateGoldRetailPrice({grossWgt:grossWt,stoneWgt,goldPrice,stoneAmount,mcgm:mc,digits:3});
      return {...prev,itemCode:{value:item.itemId,label:item.itemName},description:item.itemName || "",purity:Number(item.goldPurity || 0),qty:1,grossWt,stoneWt,netWt,goldPrice,mcPerGm:mc,stoneAmount,unitPricePerGm:unit,price,amount:calculateGoldRetailAmount({price,qty:1,digits:3}),barcode:item.barcode || ""};
    });
    setItemError({});
  };
  const getItemDetails = async (selectedId) => {
    if (!selectedId) return;
    setItemLoadingNew(true);
    try {
      applyItemResponse(await salesApi.scanItem({itemCode:selectedId,session,onSessionRefreshed}));
    } catch(error) { setItemError((prev)=>({...prev,itemCode:error.message || "Unable to retrieve item."})); }
    finally { setItemLoadingNew(false); }
  };
  const searchItemOptions = React.useCallback(async (term) => {
    const value=String(term || "").trim(); if(value.length<2){setItemOptions([]);return;}
    try { const result=await salesApi.searchItems({term:value,session,onSessionRefreshed}); setItemOptions((result || []).map(x=>({value:x.itemId,label:x.itemName}))); }
    catch { setItemOptions([]); }
  },[session?.accessToken,session?.tenantKey]);
  const options = itemOptions;
  console.log(InvoiceDataViaPhn, "data via phm");
  const dynamicFields = useMemo(() => {
    return addItemFormFields.map((field) => {
      if (field.key === "unitPricePerGm") {
        return {
          ...field,
          label:
            currentProduct?.itemType !== "perPiece"
              ? "Unit Price/gm"
              : "Unit Price/Pcs",
        };
      }

      if (field.key === "mcPerGm") {
        return {
          ...field,
          label:
            currentProduct?.itemType === "perPiece"
              ? "MC Per Pcs"
              : "MC Per Gm",
        };
      }

      return field;
    });
  }, [currentProduct?.itemType]);
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
  //       stoneAmount: parseFloat(itemData.TranStoneAmt) || 0,
  //     };
  //     updatedProductDetails.netWt =
  //       updatedProductDetails.grossWt - updatedProductDetails.stoneWt;
  //     updatedProductDetails.unitPricePerGm = calculateGoldRetailPricePerGm({
  //       grossWgt: updatedProductDetails.grossWt,
  //       stoneWgt: updatedProductDetails.stoneWt,
  //       goldPrice: updatedProductDetails.goldPrice,
  //       stoneAmount: stoneAmount,
  //       mcgm: updatedProductDetails.mcPerGm,
  //       digits: 3,
  //     });
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
    console.log(isbarCodeValid, "Updated isbarCodeValid");
  }, [isbarCodeValid]);

  const transDate = (() => {
    const rawDate = formData?.date;

    // Check if it's already in "YYYY-MM-DD" format
    const isFormatted = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);

    if (isFormatted) {
      return rawDate;
    }

    const parsed = moment(rawDate);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
  })();

  useEffect(() => {
    if (!transDate || !session?.accessToken) return;
    returnApi.listOriginalInvoices({ date: transDate, session, onSessionRefreshed })
      .then((rows) => setReturnOriginalInvoices(Array.isArray(rows) ? rows : []))
      .catch(() => setReturnOriginalInvoices([]));
  }, [transDate, session?.accessToken]);

  const applyOriginalInvoice = (data) => {
    if (!data?.header) return;
    const header = data.header;
    const lookupValue = (collection, text) => collection?.find((x) =>
      String(x.fldID) === String(text) || String(x.fldDisplay || "").toLowerCase() === String(text || "").toLowerCase()
    )?.fldID || text || "";
    setFormData((prev) => ({
      ...prev,
      againstInvoice: String(header.transactionNo || prev.againstInvoice || ""),
      refNo: header.referenceNo || "",
      civilId: header.customerCivilId || "",
      mobile: header.customerMobile || "",
      customerPhone: header.customerPhone || "",
      customerName: header.customerName || "",
      nationality: lookupValue(comboBox?.country, header.nationality),
      area: lookupValue(comboBox?.area, header.areaCode),
      TotalAmount: Number(header.totalAmount || 0),
      NetAmount: Number(header.netAmount || 0),
    }));
    setRows((data.items || []).map((item) => ({
      id: `return-${header.transactionNo}-${item.lineNo}`,
      itemCode: { label: item.description || item.itemId, value: item.itemId },
      description: item.description || "", purity: Number(item.purity || 0),
      qty: Number(item.quantity || 0), grossWt: Number(item.goldWeight || 0),
      stoneWt: Number(item.stoneWeight || 0), netWt: Number(item.netWeight || 0),
      goldPrice: Number(item.goldRate || 0), mcPerGm: String(item.makingRate || 0),
      mcType: 0, unitPricePerGm: Number(item.goldWeight || 0) > 0 ? Number(item.amount || 0) / Number(item.goldWeight || 1) : Number(item.amount || 0),
      stoneAmount: Number(item.stoneAmount || 0), price: Number(item.amount || 0), amount: Number(item.amount || 0),
      barcode: item.barcode || "",
    })));
    setOriginalInvoiceDate(header.invoiceDate || null);
    setDiscount(Number(header.discountAmount || 0));
    setRemarks(header.remarks || "");
  };

  const loadOriginalInvoice = async (transactionNo) => {
    if (!transactionNo) return;
    setReturnApiLoading(true);
    try {
      const data = await returnApi.getOriginalInvoice({ transactionNo, session, onSessionRefreshed });
      applyOriginalInvoice(data);
    } catch (error) {
      setValidationPopup({ show: true, message: error.message || "Unable to retrieve the original sales invoice." });
    } finally { setReturnApiLoading(false); }
  };

  const handleFormChange = (fieldName, value) => {
    let finalValue = value;

    if (fieldName === "date") {
      finalValue =
        value === null ? null : dayjs(value).isValid() ? dayjs(value) : dayjs();
    }

    setFormData((prev) => ({ ...prev, [fieldName]: finalValue }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };
  const handleKeyDown = (e, fieldName, value) => {
    if (
      (e.key === "Enter" || e.key === "Tab") &&
      fieldName === "againstInvoice" &&
      value &&
      value.trim() !== ""
    ) {
      console.log(formData.againstInvoice, value, "key down clicked");

      const againstInvoice =
        fieldName === "againstInvoice" ? value : formData.againstInvoice;

      const mobile = fieldName === "mobile" ? value : formData.mobile;
      const civilId = fieldName === "civilId" ? value : formData.civilId;

      getCustViaPhn(fieldName, againstInvoice, mobile, civilId);
    }
  };

  const handleBlur = (fieldName, value) => {
    fieldName === "againstInvoice" && (!value == null || !value.trim() == "");
    {
      console.log(formData.againstInvoice, value, "blur");

      const againstInvoice =
        fieldName === "againstInvoice" ? value : formData.againstInvoice;
      const mobile = fieldName === "mobile" ? value : formData.mobile;
      const civilId = fieldName === "civilId" ? value : formData.civilId;
      getCustViaPhn(fieldName, againstInvoice, mobile, civilId);
    }
  };
  const [discount, setDiscount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [formSaved, setFormSaved] = useState(false);

  const totalAmount = rows.reduce(
    (sum, row) => sum + parseFloat(row.amount || 0),
    0,
  );

  const netAmount = totalAmount - parseFloat(discount || 0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [invoiceData, setInvoiceData] = useState([]);
  const handleInvoiceHeader = (payload) => {
    const data = payload?.InvoiceHeader;

    if (!Array.isArray(data) || data.length === 0) return;

    if (data.length === 1) {
      setFormData((prev) => ({
        ...prev,
        againstInvoice: data[0].TranNo || "",
      }));
    } else {
      setInvoiceData(data);
      setPopupOpen(true);
    }
    clearPartyData();
  };
  const hasHandled = useRef(false);
  useEffect(() => {
    if (InvoiceDataViaPhn) {
      handleInvoiceHeader(InvoiceDataViaPhn);
      hasHandled.current = true;
    }
  }, [InvoiceDataViaPhn]);
  // useEffect(() => {
  //   return () => {
  //     clearPartyData();
  //   };
  // }, []);
  // const handleSelect = (selectedRow) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     againstInvoice: selectedRow.TranNo || "",
  //   }));
  //   setPopupOpen(false);
  //   setCurrentItem(selectedRow.TranNo);
  // };
  const handleSelect = (selectedRow) => {
    const tranNo = selectedRow.TranNo || "";
    setFormData((prev) => ({ ...prev, againstInvoice: tranNo }));
    setPopupOpen(false);
    setCurrentItem(tranNo);

    loadOriginalInvoice(tranNo);
  };

  console.log(formData.againstInvoice, "againstinvoice");
  // useEffect(() => {
  //   if (formData.againstInvoice) {
  //     getAgainstInvoice({
  //       CompanyId: authData && authData.companyId,
  //       LocationId: authData && authData.locationId,
  //       YearNo: authData && authData.companyDetails[0]?.FinancialYear,
  //       TransactionType: "GRET",
  //       TransactionNo: formData.againstInvoice,
  //       MachineNo: 0,
  //     });
  //   }
  // }, [currentItem]);
  const getCustViaPhn = (
    triggeredFieldName,
    againstInvoice,
    mobile,
    civilId,
  ) => {
    const isEmpty = (val) =>
      val === null ||
      val === undefined ||
      val.toString().trim() === "" ||
      val === "0";

    switch (triggeredFieldName) {
      case "againstInvoice":
        if (isEmpty(formData.againstInvoice)) {
          return;
        }

        loadOriginalInvoice(againstInvoice);
        break;
      case "mobile":
        console.log("condition triggered");
        if (
          isEmpty(formData.mobile) ||
          !isEmpty(formData.againstInvoice) ||
          !isEmpty(formData.civilId)
        ) {
          return;
        }

        setReturnApiLoading(true);
        returnApi.listOriginalInvoices({ mobileNo: formData.mobile, session, onSessionRefreshed })
          .then((data) => handleInvoiceHeader({ InvoiceHeader: (data || []).map((x) => ({ TranNo:x.transactionNo, TranDate:x.invoiceDate, TranPrtName:x.customerName, TranPrtMobile:x.customerPhone, TranPrtCivilId:x.customerCivilId })) }))
          .catch((error) => setValidationPopup({ show:true, message:error.message || "Unable to find sales invoices." }))
          .finally(() => setReturnApiLoading(false));
        break;

      case "civilId":
        console.log("condition civilId triggered");
        if (
          isEmpty(formData.civilId) ||
          !isEmpty(formData.mobile) ||
          !isEmpty(formData.againstInvoice)
        ) {
          return;
        }

        setReturnApiLoading(true);
        returnApi.listOriginalInvoices({ civilId: formData.civilId, session, onSessionRefreshed })
          .then((data) => handleInvoiceHeader({ InvoiceHeader: (data || []).map((x) => ({ TranNo:x.transactionNo, TranDate:x.invoiceDate, TranPrtName:x.customerName, TranPrtMobile:x.customerPhone, TranPrtCivilId:x.customerCivilId })) }))
          .catch((error) => setValidationPopup({ show:true, message:error.message || "Unable to find sales invoices." }))
          .finally(() => setReturnApiLoading(false));
        break;

      default:
        return;
    }
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
  const numberString = Object.keys(returnInvoiceData)
    .filter((key) => !isNaN(key)) // only numeric keys
    .sort((a, b) => a - b) // sort keys numerically
    .map((key) => returnInvoiceData[key]) // get values
    .join(""); // join into one string

  const finalNumber = parseInt(numberString, 10);
  useEffect(() => {
    if (formSaved && currentIvoice) {
      setFormData((prevState) => ({
        ...prevState,
        invoiceNo: currentIvoice,
      }));
    }
  }, [formSaved, currentIvoice]);
  console.log(finalNumber, returnInvoiceData, currentIvoice, "finalNumber");
  // const handleSubmit = () => {
  //   try {
  //     let isValid = true;
  //     const updatedErrors = { itemDetails: {} };
  //     if (!validateForm(customerDetailsRequiredFields, setErrors, formData)) {
  //       isValid = false;
  //     }

  //     if (rows.length < 1) {
  //       setErrors((prev) => ({
  //         ...prev,
  //         general: "Please add at least one item.",
  //       }));
  //       console.warn("Validation Failed: No items added.");
  //       return;
  //     }

  //     rows.forEach((row, index) => {
  //       const rowErrors = validateTableRowsData(addItemFormFields, row);
  //       if (Object.keys(rowErrors).length > 0) {
  //         isValid = false;
  //         updatedErrors.itemDetails[index] = rowErrors;
  //       }
  //     });

  //     if (!isValid) {
  //       setErrors((prev) => ({ ...prev, ...updatedErrors }));
  //       console.error("Validation Errors:", updatedErrors);
  //       return;
  //     }

  //     if (remainingAmount !== 0) {
  //       setErrors((prev) => ({ ...prev, payment: "Please add the payment." }));
  //       alert("No Payment added.");
  //       console.warn("Validation Failed: No Payment added.");
  //       return;
  //     }

  //     setErrors({ itemDetails: {} });

  //     const strTransactionTable = formatedItemData(rows);
  //     const strClsInventory = formatedCusDetails(formData);
  //     const strPaymentTable = formatedPaymentBreakdown(paymentRows);

  //     const newData = {
  //       strTransactionTable,
  //       strClsInventory,
  //       strPaymentTable,
  //       setCurrentInvoice,
  //     };

  //     console.info("Submitting Data:", newData);
  //     returnInvoice(newData);
  //     setFormSaved(true);
  //   } catch (error) {
  //     console.error("Error during form submission:", error);
  //     alert("An unexpected error occurred. Please try again later.");
  //   }
  // };
  const buildSalesReturnRequest = () => {
    const currency = comboBox?.currency?.[0];
    const currencyId = currency?.fldID || "KWD";
    const items = rows.map((item, index) => ({
      lineNo:index+1, itemId:item.itemCode?.value || item.itemCode || "", barcode:item.barcode || "",
      itemDescription:item.description || "", invoiceItemDescription:item.description || "", transactionTypeId:0, makingTypeId:Number(item.mcType || 0),
      goldPurity:Number(item.purity || 0), quantity:Number(item.qty || 0), goldWeight:Number(item.grossWt || 0), stoneWeight:Number(item.stoneWt || 0),
      goldNetWeight:Number(item.netWt || 0), goldPureWeight:Number(item.pureWeight || 0), goldRate:Number(item.goldPrice || 0),
      makingRate:Number(item.mcPerGm || 0), makingCost:0, rate:Number(item.unitPricePerGm || 0), amount:Number(item.amount || 0),
      makingAmount:Number(item.mcPerGm || 0) * Number(item.netWt || 0), goldAmount:0, stoneAmount:Number(item.stoneAmount || 0),
      wasteAmount:0, taxPercentage:0, deductionWeight:Number(item.deductionWt || 0), deductionPercentage:Number(item.deductionPrcnt || 0), repairFlag:false, repairWeight:0
    }));
    const payments = paymentRows.map((item,index) => ({
      lineNo:index+1, paymentTypeId:item.payType?.value || "", amount:Number(item.amount || 0), currencyId,
      exchangeRate:Number(item.exchangerate || currency?.rate || 1), currencyAmount:Number(item.amount || 0),
      authorizationCode:item.authorizationCode || "", accountNo:item.act?.value || "", chequeNo:item.cheaqueNo || "",
      chequeDate:item.cheaqueDate ? dayjs(item.cheaqueDate).format("YYYY-MM-DD") : null
    }));
    return { header:{
      invoiceDate:dayjs(formData.date).format("YYYY-MM-DD"), invoiceType:0, invoiceAgainst:1, referenceNo:formData.refNo || "",
      customerName:formData.customerName || "", customerCivilId:formData.civilId || "", customerMobile:formData.mobile || "", customerPhone:formData.customerPhone || "",
      customerCountryCode:comboBox?.country?.find(x=>String(x.fldID)===String(formData.nationality))?.fldDisplay || formData.nationality || "",
      customerAreaCode:formData.area || "", salesmanId:formData.salesman || "", currencyId, exchangeRate:1,
      totalAmount:Number(totalAmount.toFixed(3)), discountAmount:Number(discount || 0), netAmount:Number(netAmount.toFixed(3)),
      grossWeight:items.reduce((a,x)=>a+x.goldWeight,0), pureWeight:items.reduce((a,x)=>a+x.goldPureWeight,0),
      goldRate:items[0]?.goldRate || 0, stoneWeight:items.reduce((a,x)=>a+x.stoneWeight,0), stoneAmount:items.reduce((a,x)=>a+x.stoneAmount,0),
      remarks:remarks || "", originalInvoiceYear:0, originalInvoiceNo:String(formData.againstInvoice || ""), originalInvoiceDate:originalInvoiceDate ? dayjs(originalInvoiceDate).format("YYYY-MM-DD") : null
    }, items, payments };
  };

  const handleSubmit = () => {
    try {
      const updatedErrors = { customerDetails: {}, itemDetails: {} };

      // 1️⃣ Validate customer details
      for (let field of customerDetailsRequiredFields) {
        const value = formData[field.key];
        if (!value || value.toString().trim() === "") {
          updatedErrors.customerDetails[field.key] = field.message;
          setErrors((prev) => ({ ...prev, ...updatedErrors }));

          setValidationPopup({
            show: true,
            message: `Customer form field error:${field.message}`, // Single field error
          });
          return;
        }
      }

      // 2️⃣ Validate each item row
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const rowErrors = validateTableRowsData(addItemFormFields, row);

        if (rowErrors && Object.keys(rowErrors).length > 0) {
          const firstErrorKey = Object.keys(rowErrors)[0];
          const field = addItemFormFields.find((f) => f.key === firstErrorKey);
          const label = field?.label || firstErrorKey;
          const message = rowErrors[firstErrorKey];

          updatedErrors.itemDetails[index] = rowErrors;
          setErrors((prev) => ({ ...prev, ...updatedErrors }));

          setValidationPopup({
            show: true,
            message: `Row ${index + 1} - ${label}: ${message}`, // single field error
          });
          return;
        }
      }

      if (!String(formData.againstInvoice || "").trim()) {
        setValidationPopup({ show:true, message:"Please select the original sales invoice to return." });
        return;
      }

      // 3️⃣ Check if at least one item is added
      if (!rows || rows.length < 1) {
        setErrors((prev) => ({
          ...prev,
          general: "Please add at least one item.",
        }));
        setValidationPopup({
          show: true,
          message: "Please add at least one item to continue.",
        });
        return;
      }

      // 4️⃣ Check remaining payment
      if (remainingAmount !== 0) {
        setErrors((prev) => ({ ...prev, payment: "Please add the payment." }));
        setValidationPopup({
          show: true,
          message: "Please ensure full payment is added before saving.",
        });
        return;
      }

      // 5️⃣ Clear previous errors
      setErrors({ customerDetails: {}, itemDetails: {} });

      // 6️⃣ Build the typed GRET request. Tenant/company/location/year/user remain server-owned.
      const request = buildSalesReturnRequest();

      // 7️⃣ Submit through the authenticated API.
      setReturnApiLoading(true);
      returnApi.saveSalesReturn({ request, session, onSessionRefreshed })
        .then((result) => {
          setFormSaved(true);
          setCurrentInvoice(result.transactionNo || "");
          setFormData((prev) => ({ ...prev, invoiceNo: result.transactionNo || "" }));
          setValidationPopup({ show:true, message: result.posted
            ? `Return invoice ${result.transactionNo} saved and posted successfully.`
            : `Return invoice ${result.transactionNo} was saved, but posting requires attention. ${result.message || ""}` });
        })
        .catch((error) => setValidationPopup({ show:true, message:error.message || "Unable to save return invoice." }))
        .finally(() => setReturnApiLoading(false));
    } catch (error) {
      console.error("Submission error:", error);
      setValidationPopup({
        show: true,
        message: "Error occurred on submission. Please try again.",
      });
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

  const handleItemFormChange = (e) => {
    let fieldName = e.target.name;
    const value = e.target.value;

    // const finalValue =
    //   ["stoneAmount", "stoneWt"].includes(fieldName) &&
    //   (value === "" || value === null)
    //     ? 0
    //     : value;
    const finalValue = value;
    const updatedRow = { ...currentProduct, [fieldName]: finalValue };
    updatedRow.netWt =
      parseFloat(updatedRow.grossWt || 0) -
        parseFloat(updatedRow.stoneWt || 0) || 0;
    if (
      !updatedRow.stoneWt ||
      parseFloat(updatedRow.stoneWt) === 0 ||
      parseFloat(updatedRow.stoneWt) == ""
    ) {
      updatedRow.stoneAmount = 0;
    }
    if (
      [
        "grossWt",
        "stoneWt",
        "goldPrice",
        "stoneAmount",
        "mcPerGm",
        "qty",
        "itemType",
      ].includes(fieldName) ||
      ["pureWeight", "goldPrice", "qty"].includes(fieldName)
    ) {
      {
        updatedRow.unitPricePerGm = calculateGoldRetailPricePerGm({
          grossWgt: updatedRow.grossWt,
          stoneWgt: updatedRow.stoneWt,
          goldPrice: updatedRow.goldPrice,
          stoneAmount: updatedRow.stoneAmount,
          mcgm: updatedRow.mcPerGm,
          itemType: updatedRow.itemType,
          qty: updatedRow.qty,
          digits: 3,
        });
      }
      {
        updatedRow.price = calculateGoldRetailPrice({
          grossWgt: updatedRow.grossWt,
          stoneWgt: updatedRow.stoneWt,
          goldPrice: updatedRow.goldPrice,
          stoneAmount: updatedRow.stoneAmount,
          mcgm: updatedRow.mcPerGm,
          digits: 3,
          itemType: updatedRow.itemType,
          qty: updatedRow.qty,
        });
      }
      updatedRow.amount = calculateGoldRetailAmount({
        price: updatedRow.price,
        qty: updatedRow.qty,
        digits: 3,
      });
      const itemType = String(updatedRow.itemType).trim();

      if (itemType === "perPiece") {
        updatedRow.amount = calculateGoldSalePerPcs({
          price: updatedRow.price,
          qty: updatedRow.qty,
          stoneAmount: updatedRow.stoneAmount,
          digits: 3,
        });
      } else {
        updatedRow.amount = calculateGoldSalePerGram({
          price: updatedRow.price,
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
  // useEffect(() => {
  //   if (currentIvoice) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       invoiceNo: currentIvoice || "",
  //     }));
  //   }
  // }, [currentIvoice]);
  console.log(currentIvoice, formData.invoiceNo, "current invoice");
  return (
    <>
      <div className="main-section">
        <MainHeading
          heading={`Sales Return Invoice${
            currentIvoice && !isNaN(parseInt(currentIvoice))
              ? ` - ${parseInt(currentIvoice)}`
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
            <CustomerDetailsForm
              data={comboBox}
              formData={formData}
              errors={errors}
              onFormChange={handleFormChange}
              type={"returnInvoice"}
              invoice={tranNoList}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
          </Box>

          <Divider sx={{ mt: 0 }} />
          {(returnInvoiceloading ||
            againstInvoiceDataloading ||
            InvoiceDataViaPhnloading || returnApiLoading) && <Loader />}
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
              callFilterAction={searchItemOptions}
              serverSideSearch={true}
              resetState={resetItemFormState}
              handleSubmit={handleAddItemSave}
              onFormChange={handleItemFormChange}
              fields={dynamicFields}
              loading={itemLoadingNew}
              errors={itemError}
              setErrors={setItemError}
              currentItemEdit={editIndex}
              isItembarCodeValid={isbarCodeValid}
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
                  loading={itemLoadingNew}
                  // startIcon={<AddIcon />}
                />
              </Grid>
            </Grid>
            <Typography className="Mui-error text-error" component={"p"}>
              {rows.length <= 0 && errors?.general && errors.general}
            </Typography>

            <Grid
              className="invoice-table-payment-section-main"
              container
              spacing={3}
              sx={{ flexGrow: 1, mt: 1 }}
            >
              <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                <PaymentBreakdownTable
                  paymentRows={paymentRows}
                  setPaymentRows={setPaymentRows}
                  netAmount={netAmount}
                  setRemainingBalance={setRemainingAmount}
                  paymentOptions={comboBox && comboBox?.paytype}
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
            isSaving={createLoading}
            handleSave={handleSubmit}
            type={"GRET"}
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
            handleList={() => handleList("GRET")}
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
            handleConfirm={handleItemDeleteConfirm}
          />
          <Popup
            show={validationPopup.show}
            setShow={(val) =>
              setValidationPopup((prev) => ({ ...prev, show: val }))
            }
            // message={validationPopup.message}
            description={validationPopup.message}
            handleConfirm={() =>
              setValidationPopup((prev) => ({ ...prev, show: false }))
            }
            okOnly={true}
          />
          <InvoicePopup
            open={popupOpen}
            title="Select Invoice"
            columns={columns}
            data={invoiceData}
            keyField="TranNo"
            onClose={() => setPopupOpen(false)}
            onSelect={handleSelect}
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
  tableData: _.get(invoice, "tableData", []),

  againstInvoiceData: _.get(invoice, "againstInvoiceData", []),
  authData: _.get(auth, "authData", {}),
  InvoiceDataViaPhn: _.get(invoice, "InvoiceDataViaPhn", []),

  InvoiceDataViaPhnloading: _.get(invoice, "InvoiceDataViaPhnloading", false),

  // returnInvoiceData: _.get(invoice, "returnInvoiceData", {}),
  returnInvoiceloading: _.get(invoice, "returnInvoiceloading", false),
  againstInvoiceDataloading: _.get(invoice, "againstInvoiceDataloading", false),

  returnInvoiceData: _.get(invoice, "returnInvoiceData", {}),
  session: {
    tenantKey: _.get(auth, "tenantKey", ""), accessToken: _.get(auth, "accessToken", null), refreshToken: _.get(auth, "refreshToken", null),
  },
});

const mapDispatchToProps = (dispatch) => ({
  getItemInformation: (data) =>
    dispatch({ type: "getItemInformationcalled", payload: data }),
  getAgainstInvoice: (data) =>
    dispatch({ type: "getAgainstInvoicecalled", payload: data }),
  getInvoiceViaPhn: (data) =>
    dispatch({ type: "getInvoiceViaPhncalled", payload: data }),
  getInvoiceViaCivilId: (data) =>
    dispatch({ type: "getInvoiceViaCivilIdcalled", payload: data }),

  returnInvoice: (data) =>
    dispatch({ type: "returnInvoicecalled", payload: data }),
  getTableData: (data) =>
    dispatch({ type: "gettableDatacalled", payload: data }),
  clearPartyData: () => dispatch(clearData()),
  onSessionRefreshed: (data) => dispatch(sessionRefreshed(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReturnInvoice);
