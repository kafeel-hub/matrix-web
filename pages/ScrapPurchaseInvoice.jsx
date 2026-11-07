import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { connect } from "react-redux";
import CustomerDetailsForm from "../components/GoldComponents/CustomerDetailsForm";
import {
  validateForm,
  validateTableRowsData,
  validateItemForm,
} from "../utilities/Validator/FormValidators";
import Grid from "@mui/material/Grid2";
import Loader from "../components/Loader/Loader";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  calculateGoldRetaildedAmount,
  calculatePureWeight,
} from "../utilities/TableCalculations/GoldRetail";
import FooterButtonsGroup from "../components/Customcomponents/FooterButtonsGroup";
import NewTable from "../components/CustomTable/NewTable";
import DiscountSection from "../components/GoldComponents/DiscountSection";
import PaymentBreakdownTable from "../components/Common/PaymentBreakdownTable";
import formatDateToISOString from "../utilities/formatDateToISOString";
import MainHeading from "../components/Common/MainHeading";
import CustomButton from "../components/Customcomponents/CustomButton";
import AddItemForm from "../components/GoldComponents/AddItemForm";
import ItemViewTable from "../components/GoldComponents/ItemViewTable";
import {
  itemTableColumns,
  addItemFormFields,
  customerDetailsRequiredFields,
} from "../constants/ScrapPurchaseConstants";
import Popup from "../components/Customcomponents/Popup";
import * as scrapApi from "../services/scrapPurchaseApi";
import { sessionRefreshed } from "../features/auth/authSlice";
// const initialRow = {
//   id: Date.now().toString(),
//   itemCode: "",
//   description: "",
//   purity: "",
//   qty: 1,
//   grossWt: "0",

//   netWt: "0",
//   goldPrice: "0",

//   price: "0",
//   amount: "0",
//   deductionWt: "0",
//   pureWeight: "0",
// };

const ScrapPurchaseInvoice = ({
  comboBox,
  getItemInformation,
  itemData,
  companyBranchlist,
  CompanyDetails,
  ScrapPurchaseInvoicecalled,
  createLoading,
  itemloading,
  authData,
  scrapInvoiceData,
  scrapInvoiceloading,
  getCustInfoByPhn,
  custInfoloading,
  custInfoViaPhn,
  session,
  onSessionRefreshed,
}) => {
  console.log("comboBox", comboBox);

  const theme = useTheme();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const initialItemFormData = addItemFormFields.reduce((acc, field) => {
    acc[field.key] = field.type === "number" ? 0 : "";
    return acc;
  }, {});
  const [currentProduct, setCurrentProduct] = useState(initialItemFormData);
  const [addItemFormOpen, setAddItemFormOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [scrapSaving, setScrapSaving] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemLoadingNew, setItemLoadingNew] = useState(false);
  const [customerLoadingNew, setCustomerLoadingNew] = useState(false);

  const [itemError, setItemError] = useState({});

  const [editIndex, setEditIndex] = useState(null);
  const [validationPopup, setValidationPopup] = useState({
    show: false,
    message: "",
  });
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
    block: "",
    jedda: "",
    street: "",
    building: "",
    floor: "",
    flat: "",
    paciNo: "",
    goldRate: "",
  });

  const [errors, setErrors] = useState({});
  const getCustViaPhn = async (triggeredFieldName, civilId, customerPhone, mobile) => {
    const clean = (v) => String(v || "").trim();
    const civil = clean(civilId);
    const phone = clean(triggeredFieldName === "mobile" ? mobile : customerPhone);
    if (!civil && !phone) return;
    setCustomerLoadingNew(true);
    try {
      const customer = await scrapApi.searchCustomer({
        civilId: civil || undefined,
        mobileNo: civil ? undefined : phone,
        session,
        onSessionRefreshed,
      });
      if (!customer) return;
      const area = comboBox?.area?.find((x) => String(x.fldID) === String(customer.areaId) || x.fldDisplay === customer.areaId);
      const nation = comboBox?.country?.find((x) => String(x.fldID) === String(customer.nationalityId) || x.fldDisplay === customer.nationalityId);
      setFormData((prev) => ({
        ...prev,
        civilId: customer.civilId || prev.civilId,
        customerName: customer.customerName || "",
        mobile: customer.mobileNo || prev.mobile,
        customerPhone: customer.alternatePhoneNo || prev.customerPhone,
        area: area?.fldID || customer.areaId || "",
        nationality: nation?.fldID || customer.nationalityId || "",
        block: customer.block || prev.block,
        jedda: customer.jaddah || prev.jedda,
        street: customer.street || prev.street,
        building: customer.building || prev.building,
        floor: customer.floor || prev.floor,
        flat: customer.flat || prev.flat,
        paciNo: customer.paciNo || prev.paciNo,
      }));
    } catch (error) {
      setValidationPopup({ show: true, message: error.message || "Unable to retrieve customer." });
    } finally {
      setCustomerLoadingNew(false);
    }
  };
  const applyItemResponse = (item) => {
    if (!item) return;
    setCurrentProduct((prev) => {
      const grossWt = Number(item.grossWeight || 0);
      const purity = Number(item.goldPurity || 0);
      const deductionWt = Number(prev.deductionWt || 0);
      const netWt = Math.max(0, grossWt - deductionWt);
      const goldPrice = Number(item.salePrice || 0);
      return {
        ...prev,
        itemCode: { value: item.itemId, label: item.itemName },
        description: item.itemName || "",
        purity,
        qty: 1,
        grossWt,
        deductionWt,
        deductionPrcnt: Number(prev.deductionPrcnt || 0),
        netWt: Number(netWt.toFixed(3)),
        pureWeight: calculatePureWeight({ netWt, purity, digits: 3 }),
        goldPrice,
        amount: calculateGoldRetaildedAmount({ price: goldPrice, qty: 1, grossWt, deductionWt, digits: 3 }),
      };
    });
    setItemError({});
  };

  const getItemDetails = async (selectedId) => {
    if (!selectedId) return;
    setItemLoadingNew(true);
    try {
      const item = await scrapApi.scanItem({ itemCode: selectedId, session, onSessionRefreshed });
      applyItemResponse(item);
    } catch (error) {
      setItemError((prev) => ({ ...prev, itemCode: error.message }));
    } finally {
      setItemLoadingNew(false);
    }
  };

  const searchItemOptions = React.useCallback(async (term) => {
    const value = String(term || "").trim();
    if (value.length < 2) { setItemOptions([]); return; }
    try {
      const result = await scrapApi.searchItems({ term: value, session, onSessionRefreshed });
      setItemOptions((result || []).map((x) => ({ value: x.itemId, label: x.itemName })));
    } catch {
      setItemOptions([]);
    }
  }, [session?.accessToken, session?.tenantKey]);

  const options = itemOptions;
  const handleKeyDown = (e, fieldName, value) => {
    if (
      (e.key === "Enter" || e.key === "Tab") &&
      (fieldName === "civilId" ||
        fieldName === "customerPhone" ||
        fieldName === "mobile") &&
      (!value == null || !value.trim() == "")
    ) {
      console.log(formData.civilId, value, "key down clicked");

      const civilId = fieldName === "civilId" ? value : formData.civilId;
      const customerPhone =
        fieldName === "customerPhone" || fieldName === "mobile"
          ? value
          : formData.customerPhone;
      const mobile = fieldName === "mobile" ? value : formData.mobile;
      getCustViaPhn(fieldName, civilId, customerPhone, mobile);
    }
  };

  const handleBlur = (fieldName, value) => {
    (fieldName === "civilId" ||
      fieldName === "customerPhone" ||
      fieldName === "mobile") &&
      (!value == null || !value.trim() == "");
    {
      console.log(formData.civilId, value, "blur");

      const civilId = fieldName === "civilId" ? value : formData.civilId;
      const customerPhone =
        fieldName === "customerPhone" || fieldName === "mobile"
          ? value
          : formData.customerPhone;
      const mobile = fieldName === "mobile" ? value : formData.mobile;
      getCustViaPhn(fieldName, civilId, customerPhone, mobile);
    }
  };
  /* Legacy customer Redux response mapping retained for reference; new API lookup is handled directly.
  useEffect(() => {
    // console.log("custInfoViaPhn updated: ", custInfoViaPhn);
    const customer =
      Array.isArray(custInfoViaPhn?.CustomerInfo) &&
      custInfoViaPhn?.CustomerInfo?.length > 0
        ? custInfoViaPhn.CustomerInfo[0]
        : null;
    console.log("Extracted customer: ", customer);
    // console.log(customer, formData.nationality, "customer");
    if (customer && comboBox) {
      const matchedArea =
        comboBox &&
        comboBox?.area &&
        comboBox.area.find((item) => item.fldDisplay == customer?.CustArea);
      const matchedNationality =
        comboBox &&
        comboBox?.country &&
        comboBox?.country.find(
          (item) => item.fldDisplay == customer?.CustNation,
        );

      setFormData((prev) => ({
        ...prev,
        civilId: customer?.CustCivilId || "",

        customerPhone:
          customer?.CustPhone2.trim() !== ""
            ? customer?.CustPhone2
            : formData?.customerPhone,
        customerName: customer?.CustName || "",
        area: matchedArea?.fldID || "",
        nationality: matchedNationality?.fldID || "",
        mobile:
          customer?.Mobile.trim() !== "" ? customer?.Mobile : formData.mobile,
      }));
      // clearPartyData();.trim
    } else {
      setFormData({
        civilId: formData.civilId || "",
        companyCRNo: "",
        contactPerson: "",
        // party: "",
        // partyName: "",
        phone: "",
        customerPhone: formData.customerPhone || "",
        amount: "",
        gold: "",
        mobile: formData.mobile || "",
        date: dayjs(),
      });
    }
  }, [custInfoViaPhn]);
  useEffect(() => {
    if (itemData && itemData[0]?.Prod_Id) {
      console.log(itemData, "itemData");
      const isItembarCodeValid =
        itemData.Prod_BarcodeFlag !== null &&
        itemData.Prod_BarcodeFlag !== "" &&
        itemData.Prod_BarcodeFlag !== "0" &&
        itemData.Prod_BarcodeFlag !== 0;

      const grossWt = isItembarCodeValid
        ? parseFloat(itemData.Prod_GWeight) || 0
        : 0;

      const updatedProductDetails = {
        ...currentProduct,
        description: itemData[0].Prod_Name || "",
        purity: itemData[0].Prod_GoldPurity || "",
        qty: parseFloat(itemData[0].TranItmGoldAmt) || 1,
        grossWt: grossWt,
        deductionWt: parseFloat(itemData[0].dedWgt) || 0,
        deductionPrcnt: parseFloat(itemData[0].ded) || 0,
        goldPrice: parseFloat(itemData[0].Prod_SalePrice) || 0,
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

        // netWt: updatedRow.netWt,
        grossWt: updatedProductDetails.grossWt,
        deductionWt: updatedProductDetails.deductionWt,
        digits: 3,
      });

      setCurrentProduct({ ...currentProduct, ...updatedProductDetails });
      setItemError({});
    }
  }, [itemData]);
  */
  console.log(itemData, "itemData");
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

  const netAmount = totalAmount - parseFloat(discount || 0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  function formatedItemData(data) {
    let newData = [];
    if (data) {
      console.log(data, "Data");
      newData = data.map((item, index) => {
        return {
          ProdSrNo: index + 1,
          ProdTranTypeId: "0",

          ProdId: item.itemCode.value,
          ProdNameInv: item.description,

          ProdGoldPurity: item.purity || "0.000",
          ProdQty: item.qty || "0.000",
          ProdMcTypeId: item.mcType || "0.000",
          ProdGoldWgt: item.grossWt || "0.000",

          ProdGoldNetWgt: item.netWt || "0.000",

          ProdGoldRate: item.goldPrice || "0.000",

          ProdAmount: item.amount || "0.000",
          ProdGoldPureWgt: item.pureWeight,
          ProdDedPer: item.deductionPrcnt,
          ProdDedWgt: item.deductionWt,
          ProdBarcode: "GJW0001",
          ProdName: item.description || "JEWELLERY - 21K",
          ProdMcCost: "0",
          ProdStoneWgt: item.stoneWt || "0",
          ProdMcRate: item.mcgm || "0",
          ProdRate: item.unitPricePerGm || "0",
          ProdTaxPer: "1",
          ProdMcAmount: item?.mcPerGm || "0",
          ProdGoldAmount: "0",
          ProdStoneAmount: item.stoneAmount || "0",
          ProdRepairFlag: "0",
          ProdRepairWgt: "0",
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
        TranFinYear: CompanyDetails.FinancialYear,
        TranLocId: data.location || "1",
        TranCompanyId: "1", //find company id
        TranType: "SCRAP",
        TranNo: parseInt(data.invoiceNo) || 0,
        TranDate: formatDateToISOString(data.date),
        TranPrtName: data.customerName,
        TranNetAmt: totalAmount || "000",
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
        TranPrtBlock: data.block,
        TranPrtJedah: data.jedda,
        TranPrtStreet: data.street,
        TranPrtBuilding: data.building,
        TranPrtFloor: data.floor,
        TranPrtFlat: data.flat,
        TranPrtPaciNo: data.paciNo,
        TranPrtgoldRate: data.goldRate,
      };
      return newData;
    }
    return newData;
  }

  function formatedPaymentBreakdown(data) {
    const strPaymentTable = data.map((item, index) => {
      return {
        PaySrNo: index + 1,
        PayId: item.payType?.value,
        PayAmt: item.amount.toString() || "0.000",
        PayCurId: item.payType?.value,
        PayCurExRate: "1",
        PayCurAmt: item.amount.toString() || "1",
        PayChqNo: "123",
        PayActNo: "123",
        PayChqDate: "",
      };
    });
    return strPaymentTable;
  }
  const numberString = Object.keys(scrapInvoiceData)
    .filter((key) => !isNaN(key)) // only numeric keys
    .sort((a, b) => a - b) // sort keys numerically
    .map((key) => scrapInvoiceData[key]) // get values
    .join(""); // join into one string

  const finalNumber = parseInt(numberString, 10);
  useEffect(() => {
    if (formSaved && scrapInvoiceData) {
      setFormData((prevState) => ({
        ...prevState,
        invoiceNo: finalNumber,
      }));
    }
  }, [formSaved, scrapInvoiceData]);
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
  //     };

  //     console.info("Submitting Data:", newData);
  //     ScrapPurchaseInvoicecalled(newData);
  //     setFormSaved(true);
  //   } catch (error) {
  //     console.error("Error during form submission:", error);
  //     alert("An unexpected error occurred. Please try again later.");
  //   }
  // };
  const findLookupName = (collection, id) =>
    collection?.find((x) => String(x.fldID) === String(id))?.fldDisplay || String(id || "");

  const buildScrapPurchaseRequest = () => {
    const currency = comboBox?.currency?.[0];
    const currencyId = currency?.fldID || "KWD";
    const items = rows.map((item, index) => {
      const grossWt = Number(item.grossWt || 0);
      const deductionWt = Number(item.deductionWt || 0);
      const netWt = Number(item.netWt || Math.max(0, grossWt - deductionWt));
      const purity = Number(item.purity || 0);
      const goldPrice = Number(item.goldPrice || 0);
      return {
        lineNo: index + 1,
        itemId: item.itemCode?.value || item.itemCode || "",
        barcode: item.barcode || "",
        itemDescription: item.description || "",
        transactionTypeId: 0,
        makingTypeId: Number(item.mcType || 0),
        goldPurity: purity,
        quantity: Number(item.qty || 0),
        goldWeight: grossWt,
        stoneWeight: Number(item.stoneWt || 0),
        goldNetWeight: netWt,
        goldPureWeight: Number(item.pureWeight || ((netWt * purity) / 999).toFixed(3)),
        goldRate: goldPrice,
        makingRate: Number(item.mcgm || 0),
        makingCost: 0,
        rate: netWt > 0 ? Number((Number(item.amount || 0) / netWt).toFixed(3)) : 0,
        amount: Number(item.amount || 0),
        makingAmount: Number(item.mcPerGm || 0),
        goldAmount: Number(item.amount || 0),
        stoneAmount: Number(item.stoneAmount || 0),
        taxPercentage: 0,
        deductionWeight: deductionWt,
        deductionPercentage: Number(item.deductionPrcnt || 0),
        repairFlag: false,
        repairWeight: 0,
      };
    });
    const payments = paymentRows.map((item, index) => ({
      lineNo: index + 1,
      paymentTypeId: item.payType?.value || "",
      amount: Number(item.amount || 0),
      currencyId,
      exchangeRate: Number(item.exchangerate || currency?.rate || 1),
      currencyAmount: Number(item.amount || 0),
      authorizationCode: item.authorizationCode || "",
      accountNo: item.act?.value || "",
      chequeNo: item.cheaqueNo || "",
      chequeDate: item.cheaqueDate ? dayjs(item.cheaqueDate).format("YYYY-MM-DD") : null,
    }));
    return {
      header: {
        invoiceDate: dayjs(formData.date).format("YYYY-MM-DD"),
        invoiceType: 0,
        referenceNo: formData.refNo || "",
        customerName: formData.customerName || "",
        customerCivilId: formData.civilId || "",
        customerMobile: formData.mobile || "",
        customerPhone: formData.customerPhone || "",
        customerCountryCode: findLookupName(comboBox?.country, formData.nationality),
        customerAreaCode: formData.area || "",
        customerBlock: formData.block || "",
        customerJaddah: formData.jedda || "",
        customerStreet: formData.street || "",
        customerBuilding: formData.building || "",
        customerFloor: formData.floor || "",
        customerFlat: formData.flat || "",
        customerPaciNo: formData.paciNo || "",
        salesmanId: formData.salesman || "",
        goldRate: Number(formData.goldRate || 0),
        netAmount: Number(netAmount.toFixed(3)),
        discountAmount: Number(discount || 0),
        scrapAmount: Number(totalAmount.toFixed(3)),
        remarks: remarks || "",
      },
      items,
      payments,
    };
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

      // 6️⃣ Build the modern Scrap Purchase API request. Tenant/company/location/year/user are server-owned.
      const request = buildScrapPurchaseRequest();

      // 7️⃣ Submit through the authenticated API.
      setScrapSaving(true);
      scrapApi.saveScrapPurchase({ request, session, onSessionRefreshed })
        .then((result) => {
          setFormSaved(true);
          setFormData((prev) => ({ ...prev, invoiceNo: result.transactionNo || "" }));
          setValidationPopup({
            show: true,
            message: result.posted
              ? `Scrap purchase ${result.transactionNo} saved and posted successfully.`
              : `Scrap purchase ${result.transactionNo} was saved, but posting requires attention. ${result.message || ""}`,
          });
        })
        .catch((error) => setValidationPopup({ show: true, message: error.message || "Unable to save scrap purchase." }))
        .finally(() => setScrapSaving(false));
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

  // const handleItemFormChange = (e) => {
  //   let fieldName = e.target.name;
  //   const updatedRow = { ...currentProduct, [fieldName]: e.target.value };
  //   updatedRow.netWt =
  //     parseFloat(updatedRow.grossWt || 0) -
  //     parseFloat(updatedRow.deductionWt || 0);

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
  //     updatedRow.pureWeight = calculatePureWeight({
  //       netWt: updatedRow.netWt,
  //       purity: updatedRow.purity,

  //       digits: 3,
  //     });

  //     updatedRow.amount = calculateGoldRetailAmount({
  //       price: updatedRow.price,
  //       qty: updatedRow.qty,
  //       digits: 3,
  //     });
  //   }
  //   setCurrentProduct(updatedRow);
  //   setItemError((prev) => ({ ...prev, [fieldName]: "" }));
  // };

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
      deductionPrcnt = (deductionWt / grossWt) * 100;
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
        price: updatedRow.goldPrice,
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

  useEffect(() => {
    if (state) {
      setIsEdit(true);
      const formattedDate = state.formData.date
        ? dayjs(state.formData.date)
        : null;
      setFormData((prevState) => ({
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
  const handleList = (type) => {
    navigate(`/gold-data-table`, {
      state: { type: type },
    });
  };
  return (
    <>
      <div className="main-section">
        <MainHeading
          heading={`Scrap Purchase Invoice${
            formData.invoiceNo && !isNaN(parseInt(formData.invoiceNo))
              ? ` - ${parseInt(formData.invoiceNo)}`
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
              type={"scrapPurchase"}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
          </Box>

          <Divider sx={{ mt: 0 }} />
          {(scrapSaving || customerLoadingNew) && <Loader />}
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
              fields={addItemFormFields}
              loading={itemLoadingNew}
              errors={itemError}
              setErrors={setItemError}
              currentItemEdit={editIndex}
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
                  disabled={itemLoadingNew}
                  loading={itemLoadingNew}
                  // startIcon={<AddIcon />}
                />
              </Grid>
            </Grid>
            <Typography className="Mui-error text-error" component={"p"}>
              {rows.length <= 0 && errors?.general && errors.general}
            </Typography>

            <Divider sx={{ mt: 1 }} />

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
            isSaving={scrapSaving}
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
            type={"SCRAP"}
            handleList={() => handleList("SCRAP")}
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
  authData: _.get(auth, "authData", {}),
  scrapInvoiceloading: _.get(invoice, "scrapInvoiceloading", false),
  scrapInvoiceData: _.get(invoice, "scrapInvoiceData", {}),
  custInfoloading: _.get(demo, "custInfoloading", false),
  custInfoViaPhn: _.get(demo, "custInfoViaPhn", []),
  session: {
    tenantKey: _.get(auth, "tenantKey", ""),
    accessToken: _.get(auth, "accessToken", null),
    refreshToken: _.get(auth, "refreshToken", null),
  },
});

const mapDispatchToProps = (dispatch) => ({
  getItemInformation: (data) =>
    dispatch({ type: "getItemInformationcalled", payload: data }),
  ScrapPurchaseInvoicecalled: (data) =>
    dispatch({ type: "saveScrapPurchaseInvoicecalled", payload: data }),
  getCustInfoByPhn: (data) =>
    dispatch({ type: "getCustInfoByPhncalled", payload: data }),
  onSessionRefreshed: (data) => dispatch(sessionRefreshed(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScrapPurchaseInvoice);
