import React, { useEffect, useState, useRef } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { connect, useDispatch, useSelector } from "react-redux";
import CustomerInputForm from "../components/GoldComponents/CustomerInputForm";
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
import {
  savePurchaseGoldFixingVoucher, getPurchaseGoldFixingLookups, searchPurchaseGoldFixingAccounts,
  searchPurchaseGoldFixingSuppliers, getPurchaseGoldFixingSupplier, getPurchaseGoldFixingVoucher
} from "../services/purchaseGoldFixingVoucherApi";
import { sessionRefreshed } from "../features/auth/authSlice";
import { getAccountBalance } from "../services/accountBalanceApi";

const PurchaseGoldfixingVoucher = ({
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
  saveGoldFixingVoucher,
  saveGoldFixingVoucherData,
  saveGoldFixingVoucherloading,
  getPartyInformation,
  partyData,
  partyloading,
  authData,
}) => {
  const { state } = useLocation();
  const { id: routeVoucherNo } = useParams();
  const dispatch = useDispatch();
  const matrixAuth = useSelector((reduxState) => reduxState.auth || {});
  const session = { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey };
  const refreshSession = (tokens) => dispatch(sessionRefreshed(tokens));
  const requestedPartyIdRef = useRef(null);
  const [gfpLoading, setGfsLoading] = useState(false);
  const [gfpSaving, setGfsSaving] = useState(false);
  const [gfpLookups, setGfsLookups] = useState({ baseCurrencyId: "", paymentTypes: [], currencies: [], goldPurities: [] });
  const [gfpSuppliers, setGfsSuppliers] = useState([]);
  const [gfpAccounts, setGfsAccounts] = useState([]);

  const theme = useTheme();
  const navigate = useNavigate();

  // const initialItemFormData = addpaymentItem.reduce((acc, field) => {
  //   acc[field.key] = field.type === "number" ? 0 : "";
  //   console.log(acc, "acc");

  //   return acc;
  //   // console.log(acc)
  // }, {});
  const [currentProduct, setCurrentProduct] = useState("");

  const initialItemFormData = addpaymentItem.reduce(
    (acc, field) => {
      // If the field already has a value, keep it
      if (
        acc[field.key] !== undefined &&
        acc[field.key] !== null &&
        acc[field.key] !== ""
      ) {
        return acc;
      }
      acc[field.key] = field.type === "number" ? 0 : "";
      return acc;
    },
    { ...currentProduct }
  ); // start with existing values (if any)

  const [addItemFormOpen, setAddItemFormOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [appMessagePopup, setAppMessagePopup] = useState({ show: false, message: "" });
  const showAppMessage = (message) => setAppMessagePopup({ show: true, message });
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [rows, setRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);

  const [currentItem, setCurrentItem] = useState({});

  const [formData, setFormData] = useState({
    location: "",
    invoiceNo: "",
    voucherNo: "",
    date: dayjs(),
    supplier: "",
    supplierName: "",

    refNo: "",
    currency: "",
    civilId: "",
    mobile: "",
    exRate: "1",
    pricePerGrm: "",
    pureGoldPurity: "",
    goldWeight: "",
    fixingAmount: "",
    makingAmount: "",
    totalAmount: "",
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

  const options = []; // GFP has no item lookup.
  const paytype = (gfpLookups.paymentTypes || []).map((option) => ({
    label: option.paymentTypeName, value: option.paymentTypeId,
    AccountNo: option.defaultAccountNo || "", AccountName: option.defaultAccountName || ""
  }));
  const act = gfpAccounts;
  const updatecurrencyList = (gfpLookups.currencies || []).map((option) => ({
    label: option.currencyName, value: option.currencyId, raw: { ...option, ExRate: option.isBaseCurrency ? 1 : undefined }
  }));
  const gfpCurrencyList = { dtCurrency: (gfpLookups.currencies || []).map((c) => ({ CurId: c.currencyId, CurName: c.currencyName })) };
  const gfpComboBox = { supplier: gfpSuppliers.map((x) => ({ fldID: x.supplierId, fldDisplay: `${x.supplierId} ${x.supplierName || ""}`.trim() })) };
  const { makingAmount } = formData;
  useEffect(() => {
    if (formData?.currency) return;
    if (
      !currencyList ||
      !Array.isArray(currencyList?.dtCurrency) ||
      currencyList.dtCurrency.length === 0
    )
      return;

    const list = currencyList.dtCurrency;
    const match =
      list.find((c) => {
        const name = (c.CurName || "").toString().toLowerCase();
        const id = (c.CurId || "").toString().toLowerCase();
        return (
          name.includes("kuwait") ||
          name.includes("kuwaiti") ||
          id === "kwd" ||
          name.includes("kuwaati") ||
          name.includes("kuwaatidinar") ||
          name.includes("kuwaatidinner")
        );
      }) || list[0];

    if (match) {
      // use the currency id as formData.currency (your formatedCusDetails expects TranCurId: data.currency)
      setFormData((prev) => ({
        ...prev,
        currency: match.CurId,
        exRate: 1,
      }));
      // clear related errors if present
      setErrors && setErrors((prev) => ({ ...prev, currency: "", exRate: "" }));
    }
  }, [currencyList, formData?.currency, setFormData, setErrors]);

  useEffect(() => {
    const gw = parseFloat(formData.goldWeight) || 0;
    const pp = parseFloat(formData.pricePerGrm) || 0;
    const fixAmt = gw * pp;
    setFormData((prev) => ({
      ...prev,
      fixingAmount: fixAmt.toFixed(2),
    }));
  }, [formData.goldWeight, formData.pricePerGrm]);

  useEffect(() => {
    const fixAmt = parseFloat(formData.fixingAmount) || 0;
    const makingAmt = parseFloat(formData.makingAmount) || 0;
    const total = fixAmt + makingAmt;

    setFormData((prev) => ({
      ...prev,
      totalAmount: total.toFixed(2),
    }));
    setCurrentProduct((prev) => ({
      ...prev,
      amountLC: total.toFixed(2),
      amountFC: total.toFixed(2),
    }));
  }, [formData.fixingAmount, formData.makingAmount]);

  const handleFormChange = (fieldName, value) => {
    if (fieldName === "supplier") {
      getPartyDetails(value);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const [discount, setDiscount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [formSaved, setFormSaved] = useState(false);

  const totalAmount = Number(formData.totalAmount || 0);
  // const totalPureWeight = rows.reduce(
  //   (sum, row) => sum + parseFloat(row.pureWeight || 0),
  //   0
  // );
  // const totalWeight = rows.reduce(
  //   (sum, row) => sum + parseFloat(row.netWt || 0),
  //   0
  // );
  const netAmount = totalAmount;
  const [remainingAmount, setRemainingAmount] = useState(0);
  console.log(remainingAmount, formData.totalAmount, "amount");

  const getPartyDetails = async (selectedId) => {
    requestedPartyIdRef.current = selectedId;
    if (!selectedId) return;
    try {
      const [party, balance] = await Promise.all([
        getPurchaseGoldFixingSupplier({ supplierId: selectedId, session, onSessionRefreshed: refreshSession }),
        getAccountBalance({ accountNo: selectedId, session, onSessionRefreshed: refreshSession }),
      ]);
      if (String(requestedPartyIdRef.current) !== String(selectedId)) return;
      setFormData((prev) => ({
        ...prev, supplier: party.supplierId || selectedId, supplierName: party.supplierName || "",
        civilId: party.civilId || "", companyCRNo: party.crNo || "", contactPerson: party.contactPerson || "",
        phone: party.phone || "", mobile: party.phone || "", amount: String(balance.amountBalance ?? 0),
        gold: String(balance.goldBalance ?? 0), pureGoldPurity: String(party.pureGoldPurity || 999),
        currency: prev.currency || party.currencyId || gfpLookups.baseCurrencyId || ""
      }));
    } catch (e) { showAppMessage(e?.message || "Unable to load supplier details."); }
  };

  useEffect(() => {
    if (!session.accessToken || !session.tenantKey) return;
    let alive = true;
    setGfsLoading(true);
    Promise.all([
      getPurchaseGoldFixingLookups({ session, onSessionRefreshed: refreshSession }),
      searchPurchaseGoldFixingSuppliers({ search: "", take: 150, session, onSessionRefreshed: refreshSession }),
      searchPurchaseGoldFixingAccounts({ search: "", page: 1, pageSize: 100, session, onSessionRefreshed: refreshSession }),
      routeVoucherNo ? getPurchaseGoldFixingVoucher({ voucherNo: routeVoucherNo, session, onSessionRefreshed: refreshSession }) : Promise.resolve(null),
    ]).then(async ([lookup, suppliers, accounts, voucher]) => {
      if (!alive) return;
      const safeLookup = lookup || { baseCurrencyId: "", paymentTypes: [], currencies: [], goldPurities: [] };
      const supplierRows = Array.isArray(suppliers) ? suppliers : [];
      const accountOptions = (accounts?.items || []).map((a) => ({ value: a.accountNo, label: a.accountName, fldID: a.accountNo, fldDisplay: `${a.accountNo} ${a.accountName}` }));
      setGfsLookups(safeLookup); setGfsSuppliers(supplierRows); setGfsAccounts(accountOptions);
      if (!routeVoucherNo) {
        setFormData((prev) => ({ ...prev, currency: prev.currency || safeLookup.baseCurrencyId || "", exRate: prev.exRate || "1", pureGoldPurity: prev.pureGoldPurity || "999" }));
      }
      if (voucher?.header) {
        const h=voucher.header;
        let supplier=null;
        if (h.partyId) { try { supplier=await getPurchaseGoldFixingSupplier({ supplierId:h.partyId, session, onSessionRefreshed:refreshSession }); } catch {} }
        if (!alive) return;
        setIsEdit(true); setFormSaved(true);
        setFormData((prev) => ({ ...prev,
          invoiceNo:String(h.voucherNo ?? routeVoucherNo ?? ""), voucherNo:String(h.voucherNo ?? routeVoucherNo ?? ""),
          date:h.voucherDate?dayjs(h.voucherDate):prev.date, refNo:h.referenceNo || "", supplierInvoice:h.supplierInvoiceNo || "", supplier:h.partyId || "",
          supplierName:h.partyName || supplier?.supplierName || "", civilId:h.partyCivilId || supplier?.civilId || "",
          mobile:h.partyPhone || supplier?.phone || "", phone:h.partyPhone || supplier?.phone || "",
          companyCRNo:supplier?.crNo || "", contactPerson:supplier?.contactPerson || "",
          amount:String(supplier?.amountBalance ?? 0), gold:String(supplier?.goldBalance ?? 0),
          currency:h.currencyId || safeLookup.baseCurrencyId || "", exRate:String(h.exchangeRate || 1),
          pureGoldPurity:String(h.goldPurity || supplier?.pureGoldPurity || 999), goldWeight:String(h.goldWeight || 0),
          pricePerGrm:String(h.goldRate || 0), fixingAmount:String(h.goldAmount || 0), makingAmount:String(h.makingAmount || 0),
          totalAmount:String(h.totalAmountLocal || h.totalAmount || 0)
        }));
        setRemarks(h.remarks || "");
        setRows((voucher.payments || []).map((x) => {
          const pt=(safeLookup.paymentTypes || []).find((z)=>String(z.paymentTypeId)===String(x.paymentTypeId));
          const cur=(safeLookup.currencies || []).find((z)=>String(z.currencyId)===String(x.currencyId));
          return { paytype:pt?.paymentTypeName || x.paymentTypeId || "", paymentTypeId:x.paymentTypeId || "",
            account:x.accountNo || "", accountName:x.accountName || x.accountNo || "", cheaqueNo:x.chequeNo || "",
            cheaquedate:x.chequeDate?dayjs(x.chequeDate):null, amountLC:Number(x.amount || 0),
            currency:cur?.currencyName || x.currencyId || "", currencyId:x.currencyId || "", exchangerate:Number(x.exchangeRate || 1),
            amountFC:Number(x.currencyAmount || x.amount || 0), authorizationCode:x.authorizationCode || "" };
        }));
      }
    }).catch((e)=>showAppMessage(e?.message || "Unable to load Purchase Gold Fixing data."))
      .finally(()=>alive && setGfsLoading(false));
    return ()=>{alive=false;};
  }, [session.accessToken, session.tenantKey, routeVoucherNo]);

  function formatedCusDetails(data) {
    let newData = [];
    if (data) {
      console.log(data, "data");
      newData = {
        TranFinYear: CompanyDetails[0].FinancialYear,
        TranLocId: data?.location || "1",
        TranCompanyId: authData?.companyId || "1",
        TranType: "GFP",
        TranNo: parseInt(data.voucherNo) || 0,
        TranDate: formatDateToISOString(data.date),
        TranRef: data.refNo || "0.000",
        TranPrtPhone: data.mobile,
        TranPrtCivilId: data.civilId,
        TranPrtCrNo: data.companyCRNo || "",
        TranPrtName: data.supplier,
        TranCurId: data.currency,
        TranExRate: data.exRate,
        TranGoldRate: data.pricePerGrm,
        TranGoldPurity: data.pureGoldPurity,
        TranGoldGrossWgt: data.goldWeight,
        TranGoldAmount: "0",
        TranMcAmount: data.makingAmount,
        TranNetAmt: data?.totalAmount || 0.0,
        TranTotalAmt: data?.totalAmount,
        TranSysUser: "001",
        TranSubType: "GFP",
        TranScrapAmt: "0.000",
        TranRemark1: "",
        TranPrtId: data.supplier,
        TranPaymentMethodType: currentProduct?.paytype || "3",
        TranNetAmtL: data?.totalAmount || "0.000",

        TranMcAmountL: data.makingAmount || "0",

        TranInvType: "0",
        TranGoldPureWgt: "0.000",
        TranGoldAmountL: "0",

        TranFixingGold: data.goldWeight || "30",
        TranFixingGoldAmt: data?.fixingAmount || "50",
        TranVrNo: "",
        TranRemark2: " ",
        TranSManId: " ",
        TranPrtPerson: "",
        TranPrtPersonPhone: "",
        TranPrtMobile: "",
        TranPrtCountry: "",
        TranPrtArea: "",
        TranDiscAmt: 0,

        TranFixingGoldRate: data.pricePerGrm || "40",
      };
      setPricePerGrm(data.FixGoldRate);
      setFixingAmount(data.FixAmount);
      setGoldWeight(data.FixGoldWeight);
      return newData;
    }
    return newData;
  }

  function formatedPaymentBreakdown(data) {
    console.log(data, "payment table data");

    const strPaymentTable = data.map((item, index) => {
      return {
        PaySrNo: index + 1,
        PayId: currentProduct?.paytype ?? "",
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
  console.log(formData, "formData");




  const resolvePaymentTypeId = (row) => {
    const candidates=[row?.paymentTypeId,row?.paytype?.value,row?.paytype].filter(Boolean).map(String);
    const match=(gfpLookups.paymentTypes || []).find((x)=>candidates.includes(String(x.paymentTypeId)) || candidates.includes(String(x.paymentTypeName)));
    return String(match?.paymentTypeId ?? candidates[0] ?? "");
  };
  const resolveCurrencyId = (row) => {
    const candidates=[row?.currencyId,row?.currency?.value,row?.currency].filter(Boolean).map(String);
    const match=(gfpLookups.currencies || []).find((x)=>candidates.includes(String(x.currencyId)) || candidates.includes(String(x.currencyName)));
    return String(match?.currencyId ?? gfpLookups.baseCurrencyId ?? candidates[0] ?? "");
  };

  const handleSubmit = async () => {
    try {
      if (!formData.supplier) { setErrors((p)=>({...p,supplier:"Supplier is required."})); return; }
      if (!(Number(formData.goldWeight)>0)) { setErrors((p)=>({...p,goldWeight:"Gold weight must be greater than zero."})); return; }
      if (!(Number(formData.pricePerGrm)>0)) { setErrors((p)=>({...p,pricePerGrm:"Gold rate must be greater than zero."})); return; }
      if (!(Number(formData.pureGoldPurity)>0)) { setErrors((p)=>({...p,pureGoldPurity:"Gold purity is required."})); return; }
      if (Number(formData.makingAmount || 0)>0 && rows.length===0) { showAppMessage("MC Payment cannot be credit."); return; }
      const payments=rows.map((x,index)=>({
        lineNo:index+1, paymentTypeId:resolvePaymentTypeId(x), amount:Number(x?.amountLC ?? x?.amount ?? 0),
        accountNo:String(x?.account?.value ?? x?.account ?? ""), currencyId:resolveCurrencyId(x),
        exchangeRate:Number(x?.exchangerate || 1), currencyAmount:Number(x?.amountFC || 0),
        authorizationCode:String(x?.authorizationCode || ""), chequeBank:String(x?.chequeBank || ""),
        chequeNo:String(x?.cheaqueNo ?? x?.chequeNo ?? ""), chequeDate:x?.cheaquedate?dayjs(x.cheaquedate).format("YYYY-MM-DD"):null
      }));
      const request={ header:{ voucherDate:dayjs(formData.date).format("YYYY-MM-DD"), referenceNo:String(formData.refNo || ""),
        partyId:String(formData.supplier || ""), partyName:String(formData.supplierName || ""), partyPhone:String(formData.mobile || formData.phone || ""),
        partyCivilId:String(formData.civilId || ""), currencyId:String(formData.currency || gfpLookups.baseCurrencyId || ""),
        exchangeRate:Number(formData.exRate || 1), goldPurity:Number(formData.pureGoldPurity || 999), goldWeight:Number(formData.goldWeight || 0),
        goldRate:Number(formData.pricePerGrm || 0), makingAmount:Number(formData.makingAmount || 0), supplierInvoiceNo:String(formData.supplierInvoice || ""), remarks:String(remarks || "") }, payments };
      setGfsSaving(true);
      const result=await savePurchaseGoldFixingVoucher({ request, session, onSessionRefreshed:refreshSession });
      const savedVoucherNo = result?.voucherNo ?? result?.transactionNo ?? "";
      setFormSaved(true); setFormData((prev)=>({...prev,invoiceNo:String(savedVoucherNo),voucherNo:String(savedVoucherNo)}));
      showAppMessage(
        result?.posted
          ? `Purchase Gold Fixing Voucher ${savedVoucherNo} saved and posted successfully.`
          : `Purchase Gold Fixing Voucher ${savedVoucherNo} saved, but posting requires attention. ${result?.message || ""}`.trim()
      );
    } catch(error) { showAppMessage(error?.message || "Unable to save Purchase Gold Fixing Voucher."); }
    finally { setGfsSaving(false); }
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
      currency: currentProduct.currency?.label,
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
      currency: { label: productToEdit.currency },
    });
    setEditIndex(index);
    setAddItemFormOpen(true);
  };

  const handleItemFormChange = (e) => {
    const fieldName = e.target.name;
    const value = e.target.value;

    const updatedRow = { ...currentProduct, [fieldName]: value };
    console.log(updatedRow, fieldName, "formDatachange");
    if (fieldName === "amountLC" || fieldName === "exchangerate") {
      const amountLC = parseFloat(updatedRow.amountLC || 0);
      const exchangerate = parseFloat(updatedRow.exchangerate || 0);
      updatedRow.amountFC = parseFloat((amountLC * exchangerate).toFixed(3));
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
          heading={`Purchase Gold Fixing Voucher Invoice${
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
            <CustomerInputForm
              data={gfpComboBox}
              formData={formData}
              errors={errors}
              onFormChange={handleFormChange}
              type="GFP"
              currencyList={gfpCurrencyList}
              goldPurities={gfpLookups.goldPurities}
            />
          </Box>

          <Divider sx={{ mt: 0 }} />
          {gfpLoading && <Loader />}
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
                type={"GFP"}
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
                baseCurrencyId={gfpLookups.baseCurrencyId || ""}
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
                  type={"GFP"}
                />
              </Grid>
            </Grid>
          </Box>

          <FooterButtonsGroup
            isEdit={isEdit}
            isSaving={gfpSaving}
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
            type={"GFP"}
            handleList={() => handleList("GFP")}
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
  currencyList: _.get(demo, "currencyList", []),
  saveGoldFixingVoucherloading: _.get(
    invoice,
    "saveGoldFixingVoucherloading",
    false
  ),
  saveGoldFixingVoucherData: _.get(invoice, "saveGoldFixingVoucherData", {}),
  partyData: _.get(demo, "partyData", []),
  partyloading: _.get(demo, "partyloading", false),
  authData: _.get(auth, "authData", {}),
});

const mapDispatchToProps = (dispatch) => ({
  getItemInformation: (data) =>
    dispatch({ type: "getItemInformationcalled", payload: data }),
  saveGoldFixingVoucher: (data) =>
    dispatch({ type: "saveGoldFixingVouchercalled", payload: data }),
  getCurrency: (data) => dispatch({ type: "getCurrencycalled", payload: data }),
  getPartyInformation: (data) =>
    dispatch({ type: "getPartyInformationcalled", payload: data }),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PurchaseGoldfixingVoucher);
