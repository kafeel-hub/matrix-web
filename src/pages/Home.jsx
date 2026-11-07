import React, { useEffect, useState, useMemo } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Box, Divider, Typography, Tabs, Tab } from "@mui/material";
import { connect } from "react-redux";
import CustomerDetailsForm from "../components/GoldComponents/CustomerDetailsForm";
import KYCDetailsForm from "../components/GoldComponents/KYCDetailsForm";
import Grid from "@mui/material/Grid2";
import {
  calculateGoldRetailPricePerGm,
  calculateGoldRetailAmount,
  calculateGoldRetailPrice,
  calculateGoldSalePerGram,
  calculateGoldSalePerPcs,
} from "../utilities/TableCalculations/GoldRetail";
import {
  validateForm,
  validateTableRowsData,
  validateItemForm,
} from "../utilities/Validator/FormValidators";
import FooterButtonsGroup from "../components/Customcomponents/FooterButtonsGroup";
import DiscountSection from "../components/GoldComponents/DiscountSection";
import PaymentBreakdownTable from "../components/Common/PaymentBreakdownTable";
import formatDateToISOString from "../utilities/formatDateToISOString";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import MainHeading from "../components/Common/MainHeading";
import CustomButton from "../components/Customcomponents/CustomButton";
import AddItemForm from "../components/GoldComponents/AddItemForm";
import ItemViewTable from "../components/GoldComponents/ItemViewTable";
import Loader from "../components/Loader/Loader";
import {
  itemTableColumns,
  addItemFormFields,
  customerDetailsRequiredFields,
} from "../constants/SalesInvoiceConstant";
import { clearData } from "../features/demo/demoSlice";
import Popup from "../components/Customcomponents/Popup";
import * as salesApi from "../services/salesInvoiceApi";
import { sessionRefreshed } from "../features/auth/authSlice";
// checking branch//
const Home = ({
  comboBox,
  getItemInformation,
  itemData,
  companyBranchlist,
  CompanyDetails,
  saveInvoice,
  createLoading,
  itemloading,
  invoiceData,
  invoiceloading,
  getCustInfoByPhn,
  custInfoViaPhn,
  custInfoloading,
  clearPartyData,
  authData,
  session,
  onSessionRefreshed,
}) => {
  const { state } = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();

  const initialItemFormData = addItemFormFields.reduce((acc, field) => {
    acc[field.key] = field.type === "number" ? 0 : "";
    return acc;
  }, {});
  const [currentProduct, setCurrentProduct] = useState(initialItemFormData);

  // Keep the approved Sales Invoice field layout while adapting the two labels
  // that depend on whether the selected item is priced per gram or per piece.
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

  const [addItemFormOpen, setAddItemFormOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [rows, setRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);

  const [editIndex, setEditIndex] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [formSaved, setFormSaved] = useState(false);
  const [salesSaving, setSalesSaving] = useState(false);
  const [itemLoadingNew, setItemLoadingNew] = useState(false);
  const [customerLoadingNew, setCustomerLoadingNew] = useState(false);
  const [invoiceType, setInvoiceType] = useState(0);
  const [creditCustomerOptions, setCreditCustomerOptions] = useState([]);
  const [selectedCreditCustomer, setSelectedCreditCustomer] = useState(null);
  const [creditCustomerLoading, setCreditCustomerLoading] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [formData, setFormData] = useState({
    location: authData?.locationId || companyBranchlist?.[0]?.fldID || "",
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
    email: "",
    passportNo: "",
    profession: "",
    amount: "",
    // KYC Details
    purchaseReason: "",
    sourceOfFund: "",
    politicalLink: "",

    beneficiary: "",
    beneficiaryCivilId: "",
    beneficiaryNationality: "",
    beneficiaryRelation: "",
    reasonOfAbsence: "",
  });
  console.log("state data", formData);
  const [errors, setErrors] = useState({});
  const [itemError, setItemError] = useState({});
  const [isbarCodeValid, setIsbarCodeValid] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [validationPopup, setValidationPopup] = useState({
    show: false,
    message: "",
  });
  useEffect(() => {
    return () => {
      clearPartyData();
    };
  }, []);
  const [activeTab, setActiveTab] = useState(0);
  const applyItemResponse = (item) => {
    if (!item) return;
    const barcodeLocked = Number(item.barcodeFlag || 0) !== 0;
    setIsbarCodeValid(barcodeLocked);
    const grossWt = barcodeLocked ? Number(item.grossWeight || 0) : 0;
    const stoneWt = Number(item.stoneWeight || 0);
    const stoneAmount = barcodeLocked ? Number(item.stoneValue || 0) : 0;
    setCurrentProduct((prev) => ({
      ...prev,
      itemCode: { value: item.itemId, label: item.itemName },
      description: item.itemName || "",
      purity: Number(item.goldPurity || 0),
      qty: 1,
      grossWt,
      stoneWt,
      netWt: Math.max(0, grossWt - stoneWt),
      goldPrice: 0,
      mcPerGm: Number(item.salePrice || 0),
      stoneAmount,
      unitPricePerGm: 0,
      price: 0,
      amount: 0,
    }));
    setItemError({});
  };

  const getItemDetails = async (selectedId) => {
    if (!selectedId) return;
    setItemLoadingNew(true);
    try {
      const item = await salesApi.scanItem({ itemCode: selectedId, session, onSessionRefreshed });
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
      const result = await salesApi.searchItems({ term: value, session, onSessionRefreshed });
      setItemOptions((result || []).map((x) => ({ value: x.itemId, label: x.itemName })));
    } catch {
      setItemOptions([]);
    }
  }, [session?.accessToken, session?.tenantKey]);

  const options = itemOptions;
  console.log(comboBox, "comboBox");
  console.log(CompanyDetails, "company details");

  const clearCustomerFields = () => {
    setFormData((prev) => ({
      ...prev,
      civilId: "",
      mobile: "",
      customerPhone: "",
      customerName: "",
      nationality: "",
      area: "",
      email: "",
      passportNo: "",
      profession: "",
      beneficiary: "",
      beneficiaryCivilId: "",
      beneficiaryNationality: "",
    }));
  };

  const handleInvoiceTypeChange = (nextType) => {
    const normalized = Number(nextType) === 1 ? 1 : 0;
    setInvoiceType(normalized);
    setSelectedCreditCustomer(null);
    setCreditCustomerOptions([]);
    clearCustomerFields();
    setErrors((prev) => ({ ...prev, creditCustomer: "", customerDetails: {} }));
    if (normalized === 1) {
      setPaymentRows([]);
      setRemainingAmount(0);
      setActiveTab(1);
    }
  };

  const searchCreditCustomerOptions = React.useCallback(async (term) => {
    if (invoiceType !== 1) return;
    const value = String(term || "").trim();
    if (value.length < 2) {
      setCreditCustomerOptions([]);
      return;
    }
    setCreditCustomerLoading(true);
    try {
      const rows = await salesApi.searchCreditCustomers({
        term: value,
        session,
        onSessionRefreshed,
      });
      setCreditCustomerOptions((rows || [])
        .map((x) => ({
          value: x.partyId,
          label: x.name || x.partyId,
          civilId: x.civilId || "",
          phone: x.phone || "",
        })));
    } catch {
      setCreditCustomerOptions([]);
    } finally {
      setCreditCustomerLoading(false);
    }
  }, [invoiceType, session?.accessToken, session?.tenantKey]);

  const handleCreditCustomerChange = async (option) => {
    setSelectedCreditCustomer(option || null);
    if (!option?.value) {
      clearCustomerFields();
      return;
    }
    setCreditCustomerLoading(true);
    try {
      const customer = await salesApi.getCreditCustomer({
        customerId: option.value,
        session,
        onSessionRefreshed,
      });
      const nation = comboBox?.country?.find((x) =>
        String(x.fldID) === String(customer.country || "") ||
        String(x.fldDisplay || "").toLowerCase() === String(customer.country || "").toLowerCase());
      setFormData((prev) => ({
        ...prev,
        customerName: customer.name || "",
        civilId: customer.civilId || "",
        customerPhone: customer.phone || "",
        mobile: customer.phone || "",
        nationality: nation?.fldID || customer.country || "",
        area: customer.areaId || "",
      }));
      setErrors((prev) => ({ ...prev, creditCustomer: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, creditCustomer: error.message || "Unable to load credit customer." }));
    } finally {
      setCreditCustomerLoading(false);
    }
  };

  const getCustViaPhn = async (triggeredFieldName, civilId, customerPhone, mobile) => {
    if (invoiceType !== 0) return;
    const clean = (v) => String(v || "").trim();
    const civil = clean(civilId);
    const phone = clean(triggeredFieldName === "mobile" ? mobile : customerPhone);
    if (!civil && !phone) return;
    setCustomerLoadingNew(true);
    try {
      const customer = await salesApi.searchCustomer({
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
        email: customer.email || "",
        passportNo: customer.passportNo || "",
        profession: customer.profession || "",
        beneficiary: customer.beneficiary || "",
        beneficiaryCivilId: customer.beneficiaryCivilId || "",
        beneficiaryNationality: customer.beneficiaryNationality || "",
      }));
    } catch (error) {
      if (!String(error.message || "").includes("404")) console.warn("Customer lookup failed", error);
    } finally {
      setCustomerLoadingNew(false);
    }
  };
  useEffect(() => {
    console.log(isbarCodeValid, "Updated isbarCodeValid");
  }, [isbarCodeValid]);

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
  const [discount, setDiscount] = useState(0);
  const [remarks, setRemarks] = useState("");

  const totalAmount = rows.reduce(
    (sum, row) => sum + parseFloat(row.amount || 0),
    0,
  );

  const netAmount = totalAmount - parseFloat(discount || 0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const findLookupName = (collection, id) =>
    collection?.find((x) => String(x.fldID) === String(id))?.fldDisplay || String(id || "");

  const buildSalesRequest = () => {
    const currency = comboBox?.currency?.[0];
    const currencyId = currency?.fldID || "KWD";
    const items = rows.map((item, index) => {
      const purity = Number(item.purity || 0);
      const netWt = Number(item.netWt || 0);
      const qty = Number(item.qty || 0);
      const mcRate = Number(item.mcPerGm || 0);
      const makingTypeId = item.itemType === "perPiece" ? 1 : 0;
      return {
        lineNo: index + 1,
        itemId: item.itemCode?.value || item.itemCode || "",
        barcode: item.itemCode?.value || "",
        itemDescription: item.description || "",
        invoiceItemDescription: item.description || "",
        transactionTypeId: 0,
        makingTypeId,
        goldPurity: purity,
        quantity: qty,
        goldWeight: Number(item.grossWt || 0),
        stoneWeight: Number(item.stoneWt || 0),
        customerGoldWeight: netWt,
        goldNetWeight: netWt,
        goldPureWeight: Number(((netWt * purity) / 999).toFixed(3)),
        goldRate: Number(item.goldPrice || 0),
        makingRate: mcRate,
        makingCost: 0,
        rate: Number(item.unitPricePerGm || 0),
        amount: Number(item.amount || 0),
        makingAmount: Number((makingTypeId === 1 ? qty * mcRate : netWt * mcRate).toFixed(3)),
        goldAmount: Number((netWt * Number(item.goldPrice || 0)).toFixed(3)),
        stoneAmount: Number(item.stoneAmount || 0),
        wasteAmount: 0,
        taxPercentage: 0,
        deductionWeight: 0,
        deductionPercentage: 0,
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

    const grossWeight = items.reduce((a, x) => a + x.goldWeight, 0);
    const pureWeight = items.reduce((a, x) => a + x.goldPureWeight, 0);
    const stoneWeight = items.reduce((a, x) => a + x.stoneWeight, 0);
    const stoneAmount = items.reduce((a, x) => a + x.stoneAmount, 0);
    const makingAmount = items.reduce((a, x) => a + x.makingAmount, 0);
    const goldAmount = items.reduce((a, x) => a + x.goldAmount, 0);

    return {
      header: {
        invoiceDate: dayjs(formData.date).format("YYYY-MM-DD"),
        invoiceType, invoiceAgainst: 0, referenceNo: formData.refNo || "", partyType: invoiceType === 1 ? 1 : 0, customerId: invoiceType === 1 ? (selectedCreditCustomer?.value || "") : "",
        customerName: formData.customerName || "", customerNameArabic: "", customerAddress1: "", customerAddress2: "",
        customerPhone: formData.customerPhone || "", customerMobile: formData.mobile || "", customerCivilId: formData.civilId || "",
        customerCrNo: "", customerAreaCode: formData.area || "", customerCountryCode: findLookupName(comboBox?.country, formData.nationality),
        customerBlock: "", customerJaddah: "", customerStreet: "", customerBuilding: "", customerFloor: "", customerFlat: "", customerPaciNo: "",
        customerEmail: formData.email || "", customerPassportNo: formData.passportNo || "", customerProfession: formData.profession || "",
        beneficiary: formData.beneficiary || "", beneficiaryCivilId: formData.beneficiaryCivilId || "",
        beneficiaryNationality: findLookupName(comboBox?.country, formData.beneficiaryNationality), beneficiaryRelation: formData.beneficiaryRelation || "",
        beneficiaryReason: formData.reasonOfAbsence || "", sourceOfFund: formData.sourceOfFund || "", purchaseReason: formData.purchaseReason || "", politicalLink: formData.politicalLink || "",
        salesmanId: formData.salesman || "", currencyId, exchangeRate: Number(currency?.rate || 1),
        totalAmount: Number(totalAmount.toFixed(3)), discountPercentage: totalAmount ? Number(((Number(discount || 0) / totalAmount) * 100).toFixed(3)) : 0,
        discountAmount: Number(discount || 0), itemDiscountAmount: 0, netAmount: Number(netAmount.toFixed(3)), taxAmount: 0, makingAmount, goldAmount,
        grossWeight, pureWeight, goldRate: items[0]?.goldRate || 0, marketGoldRate: 0, stoneWeight, stoneAmount, deliveryCharge: 0, giftCharge: 0, otherCharge1: 0, otherCharge2: 0,
        remarks: remarks || "", remarks2: "", cashLimitConfirmed: false,
      },
      items,
      payments: invoiceType === 1 ? [] : payments,
    };
  };

  const handleSubmit = () => {
    try {
      const updatedErrors = { customerDetails: {}, itemDetails: {} };

      // 1️⃣ Validate customer details
      if (invoiceType === 1 && !selectedCreditCustomer?.value) {
        setErrors((prev) => ({ ...prev, creditCustomer: "Select an existing Credit Customer from Customer Master." }));
        setValidationPopup({
          show: true,
          message: "Select an existing Credit Customer. New Credit customers must be created in Customer Master first.",
        });
        return;
      }

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
      if (invoiceType === 0 && remainingAmount !== 0) {
        setErrors((prev) => ({ ...prev, payment: "Please add the payment." }));
        setValidationPopup({
          show: true,
          message: "Please ensure full payment is added before saving.",
        });
        return;
      }

      // 5️⃣ Clear previous errors
      setErrors({ customerDetails: {}, itemDetails: {} });

      // 6️⃣ Build the modern Sales API request. Tenant/company/location/user are server-owned from the authenticated JWT context.
      const request = buildSalesRequest();

      // 7️⃣ Submit through the new authenticated API.
      setSalesSaving(true);
      salesApi.saveSalesInvoice({ request, session, onSessionRefreshed })
        .then((result) => {
          setFormSaved(true);
          setFormData((prev) => ({ ...prev, invoiceNo: result.transactionNo || "" }));
          setValidationPopup({
            show: true,
            message: result.posted
              ? `Sales invoice ${result.transactionNo} saved and posted successfully.`
              : `Sales invoice ${result.transactionNo} was saved, but posting requires attention. ${result.message || ""}`,
          });
        })
        .catch((error) => setValidationPopup({ show: true, message: error.message || "Unable to save sales invoice." }))
        .finally(() => setSalesSaving(false));
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
      setRows(rows.filter((_, i) => i !== editIndex));
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
  console.log(rows, "item rows");
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

  return (
    <>
      <div className="main-section">
        <MainHeading
          heading={`Sales Invoice${
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
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              type={"GSAL"}
              invoiceType={invoiceType}
              onInvoiceTypeChange={handleInvoiceTypeChange}
              creditCustomerOptions={creditCustomerOptions}
              selectedCreditCustomer={selectedCreditCustomer}
              onCreditCustomerChange={handleCreditCustomerChange}
              searchCreditCustomers={searchCreditCustomerOptions}
              creditCustomerLoading={creditCustomerLoading}
            />
          </Box>

          <Divider sx={{ mt: 0 }} />
          {(invoiceloading || customerLoadingNew) && <Loader />}
          <Box sx={{ p: 2 }}>
            <ItemViewTable
              rows={rows}
              columns={itemTableColumns}
              onEdit={handleEdit}
              onDelete={handleItemDelete}
              errors={errors && errors.itemDetails}
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
              callFilterAction={searchItemOptions}
              serverSideSearch={true}
              handleSubmit={handleAddItemSave}
              onFormChange={handleItemFormChange}
              fields={dynamicFields}
              loading={itemLoadingNew}
              errors={itemError}
              setErrors={setItemError}
              currentItemEdit={editIndex}
              // callFilterAction={handleFilterAction}
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

            {/* <Divider sx={{ mt: 1 }} /> */}

            {/* <Grid
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
                  paymentOptions={comboBox && comboBox?.paytype}
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
          </Box> */}
            <Divider sx={{ mt: 1 }} />

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Tab label="Payment Details" disabled={invoiceType === 1} />
                    <Tab label="KYC Details" />
                  </Tabs>

                  <Box sx={{ mt: 2 }}>
                    {activeTab === 0 && invoiceType === 0 && (
                      <PaymentBreakdownTable
                        paymentRows={paymentRows}
                        setPaymentRows={setPaymentRows}
                        netAmount={netAmount}
                        paymentOptions={comboBox?.paytype}
                        setRemainingBalance={setRemainingAmount}
                        remainingBalance={remainingAmount}
                      />
                    )}

                    {activeTab === 1 && (
                      <KYCDetailsForm
                        formData={formData}
                        errors={errors}
                        onFormChange={handleFormChange}
                        data={comboBox}
                      />
                    )}
                  </Box>
                </Grid>

                {/* Right Side */}

                {activeTab === 0 && (
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
                )}
              </Grid>
            </Box>
          </Box>

          <FooterButtonsGroup
            isEdit={isEdit}
            isSaving={salesSaving}
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
            type={"GSAL"}
            handleList={() => handleList("GSAL")}
            handleDelete={handleItemDelete}
          />
        </Paper>

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
      </div>
    </>
  );
};
const mapStateToProps = ({ auth = {}, demo = {}, invoice = {} }) => ({
  comboBox: _.get(auth, "comboBox", []),
  itemData: _.get(demo, "itemData", []),
  companyBranchlist: _.get(auth, "companyBranchList", []),
  CompanyDetails: _.get(auth, "CompanyDetails", []),
  custInfoViaPhn: _.get(demo, "custInfoViaPhn", []),
  createLoading: _.get(auth, "invoiceloading", false),
  itemloading: _.get(demo, "itemloading", false),
  invoiceData: _.get(invoice, "invoiceData", {}),
  invoiceloading: _.get(invoice, "invoiceloading", false),
  custInfoloading: _.get(demo, "custInfoloading", false),
  authData: _.get(auth, "authData", {}),
  session: {
    tenantKey: _.get(auth, "tenantKey", ""),
    accessToken: _.get(auth, "accessToken", null),
    refreshToken: _.get(auth, "refreshToken", null),
  },
});

const mapDispatchToProps = (dispatch) => ({
  getItemInformation: (data) =>
    dispatch({ type: "getItemInformationcalled", payload: data }),
  getCustInfoByPhn: (data) =>
    dispatch({ type: "getCustInfoByPhncalled", payload: data }),
  saveInvoice: (data) => dispatch({ type: "saveInvoicecalled", payload: data }),
  clearPartyData: () => dispatch(clearData()),
  onSessionRefreshed: (data) => dispatch(sessionRefreshed(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
