// src/features/demo/demoSlice.js
import { createSlice } from "@reduxjs/toolkit";

const invoiceSlice = createSlice({
  name: "invoice",
  initialState: {
    invoiceData: {},
    invoiceloading: false,
    invoiceerror: null,
    scrapInvoiceData: {},
    scrapInvoiceloading: false,
    scrapInvoiceerror: null,
    UnfixedPurchaseloading: false,
    UnfixedPurchaseerror: null,
    UnfixedPurchaseData: {},
    receiptVoucherloading: false,
    receiptVouchererror: null,
    receiptVoucherData: {},
    paymentVoucherloading: false,
    paymentVouchererror: null,
    paymentVoucherData: {},
    returnInvoiceData: {},
    returnInvoiceloading: false,
    returnInvoiceerror: null,
    saveGoldFixingVoucherloading: false,
    saveGoldFixingVoucherData: {},
    saveGoldFixingVouchererror: null,
    saveRecieptVoucherloading: false,
    saveRecieptVoucherData: {},
    saveRecieptVouchererror: null,
    savePaymentVoucherloading: false,
    savePaymentVoucherData: {},
    savePaymentVouchererror: null,
    savePettyCashVoucherloading: false,
    savePettyCashVoucherData: {},
    savePettyCashVouchererror: null,
    purchaseGoldFixingVoucherloading: false,
    purchaseGoldFixingVouchererror: null,
    purchaseGoldFixingVoucherData: {},
    tableData: [],
    tableDataloading: false,
    tableDataerror: null,
    againstInvoiceData: [],
    againstInvoiceDataloading: false,
    againstInvoiceDataerror: null,
    customInfoAccData: [],
    customInfoAccloading: false,
    customInfoAccerror: null,
    accountInfoloading: false,
    accountInfoerror: null,
    accountInfoData: [],
    InvoiceDataViaPhnloading: false,
    InvoiceDataViaPhnerror: null,
    InvoiceDataViaPhn: [],
    showGlobalPopup: false,
    globalPopupData: {},

    invoiceDetailsLoading: false,
    invoiceDetails: {},
    invoiceDetailsError: null,
  },
  reducers: {
    invoiceInformationTrigger(state, action) {
      return {
        ...state,
        invoiceloading: action.payload,
      };
    },
    invoiceInformationSuccess: (state, action) => {
      return {
        ...state,
        invoiceloading: false,
        invoiceData: { ...action.payload },
      };
    },
    invoiceInformationFailure: (state, action) => {
      return {
        ...state,
        invoiceloading: false,
        invoiceerror: action.payload,
      };
    },
    scrapInvoiceInformationTrigger(state, action) {
      return {
        ...state,
        scrapInvoiceloading: action.payload,
      };
    },
    scrapInvoiceInformationSuccess: (state, action) => {
      return {
        ...state,
        scrapInvoiceloading: false,
        scrapInvoiceData: { ...action.payload },
      };
    },
    scrapInvoiceInformationFailure: (state, action) => {
      return {
        ...state,
        scrapInvoiceloading: false,
        scrapInvoiceerror: action.payload,
      };
    },

    returnInvoiceTrigger(state, action) {
      return {
        ...state,
        returnInvoiceloading: action.payload,
      };
    },
    returnInvoiceSuccess: (state, action) => {
      return {
        ...state,
        returnInvoiceloading: false,
        returnInvoiceData: { ...action.payload },
      };
    },
    returnInvoiceFailure: (state, action) => {
      return {
        ...state,
        returnInvoiceloading: false,
        returnInvoiceerror: action.payload,
      };
    },

    saveGoldFixingVoucherTrigger(state, action) {
      return {
        ...state,
        saveGoldFixingVoucherloading: action.payload,
      };
    },
    saveGoldFixingVoucherSuccess: (state, action) => {
      return {
        ...state,
        saveGoldFixingVoucherloading: false,
        saveGoldFixingVoucherData: { ...action.payload },
      };
    },
    saveGoldFixingVoucherFailure: (state, action) => {
      return {
        ...state,
        saveGoldFixingVoucherloading: false,
        saveGoldFixingVouchererror: action.payload,
      };
    },

    saveRecieptTrigger(state, action) {
      return {
        ...state,
        saveRecieptVoucherloading: action.payload,
      };
    },
    saveRecieptSuccess: (state, action) => {
      return {
        ...state,
        saveRecieptVoucherloading: false,
        saveRecieptVoucherData: { ...action.payload },
      };
    },
    saveRecieptFailure: (state, action) => {
      return {
        ...state,
        saveRecieptVoucherloading: false,
        saveRecieptVouchererror: action.payload,
      };
    },
    savePaymentTrigger(state, action) {
      return {
        ...state,
        savePaymentVoucherloading: action.payload,
      };
    },
    savePaymentSuccess: (state, action) => {
      return {
        ...state,
        savePaymentVoucherloading: false,
        savePaymentVoucherData: { ...action.payload },
      };
    },
    savePaymentFailure: (state, action) => {
      return {
        ...state,
        savePaymentVoucherloading: false,
        savePaymentVouchererror: action.payload,
      };
    },

    savePettyCashVoucherTrigger(state, action) {
      return {
        ...state,
        savePettyCashVoucherloading: action.payload,
      };
    },
    savePettyCashVoucherSuccess: (state, action) => {
      return {
        ...state,
        savePettyCashVoucherloading: false,
        savePettyCashVoucherData: { ...action.payload },
      };
    },
    savePettyCashVoucherFailure: (state, action) => {
      return {
        ...state,
        savePettyCashVoucherloading: false,
        savePettyCashVoucherrerror: action.payload,
      };
    },

    purchaseGoldFixingVoucherTrigger(state, action) {
      return {
        ...state,
        purchaseGoldFixingVoucherloading: action.payload,
      };
    },
    purchaseGoldFixingVoucherSuccess: (state, action) => {
      return {
        ...state,
        purchaseGoldFixingVoucherloading: false,
        purchaseGoldFixingVoucherData: { ...action.payload },
      };
    },
    purchaseGoldFixingVoucherFailure: (state, action) => {
      return {
        ...state,
        purchaseGoldFixingVoucherloading: false,
        purchaseGoldFixingVouchererror: action.payload,
      };
    },
    tableDataTrigger(state, action) {
      return {
        ...state,
        tableDataloading: action.payload,
      };
    },
    tableDataSuccess: (state, action) => {
      return {
        ...state,
        tableDataloading: false,
        tableData: action.payload,
      };
    },
    tableDataFailure: (state, action) => {
      return {
        ...state,
        tableDataloading: false,
        tableDataerror: action.payload,
      };
    },
    againstInvoiceDataTrigger(state, action) {
      return {
        ...state,
        againstInvoiceDataloading: action.payload,
      };
    },
    againstInvoiceDataSuccess: (state, action) => {
      return {
        ...state,
        againstInvoiceDataloading: false,
        againstInvoiceData: action.payload,
      };
    },
    againstInvoiceDataFailure: (state, action) => {
      return {
        ...state,
        againstInvoiceDataloading: false,
        againstInvoiceDataerror: action.payload,
      };
    },
    customInfoAccTrigger(state, action) {
      return {
        ...state,
        customInfoAccloading: action.payload,
      };
    },
    customInfoAccSuccess: (state, action) => {
      return {
        ...state,
        customInfoAccloading: false,
        customInfoAccData: action.payload,
      };
    },
    customInfoAccFailure: (state, action) => {
      return {
        ...state,
        customInfoAccloading: false,
        customInfoAccerror: action.payload,
      };
    },
    accountInfoTrigger(state, action) {
      return {
        ...state,
        accountInfoloading: action.payload,
      };
    },
    accountInfoSuccess: (state, action) => {
      return {
        ...state,
        accountInfoloading: false,
        accountInfoData: action.payload,
      };
    },
    accountInfoFailure: (state, action) => {
      return {
        ...state,
        accountInfoloading: false,
        accountInfoerror: action.payload,
      };
    },

    InvoiceDataViaPhnTrigger(state, action) {
      return {
        ...state,
        InvoiceDataViaPhnloading: action.payload,
      };
    },
    InvoiceDataViaPhnSuccess: (state, action) => {
      return {
        ...state,
        InvoiceDataViaPhnloading: false,
        InvoiceDataViaPhn: action.payload,
      };
    },
    InvoiceDataViaPhnFailure: (state, action) => {
      return {
        ...state,
        InvoiceDataViaPhnloading: false,
        InvoiceDataViaPhnerror: action.payload,
      };
    },
    setGlobalPopupData: (state, action) => {
      return {
        ...state,
        globalPopupData: action.payload,
      };
    },

    setGlobalPopupVisibility: (state, action) => {
      return {
        ...state,
        showGlobalPopup: action.payload,
      };
    },

    invoiceDetailsTrigger(state, action) {
      return {
        ...state,
        invoiceDetailsLoading: false,
      };
    },
    invoiceDetailsSuccess: (state, action) => {
      return {
        ...state,
        invoiceDetailsLoading: false,
        invoiceDetails: action.payload,
      };
    },
    invoiceDetailsFailure: (state, action) => {
      return {
        ...state,
        invoiceDetailsLoading: false,
        invoiceDetailsError: action.payload,
      };
    },
    UnfixedPurchaseInformationTrigger(state, action) {
      return {
        ...state,
        UnfixedPurchaseloading: action.payload,
      };
    },
    UnfixedPurchaseInformationSuccess: (state, action) => {
      return {
        ...state,
        UnfixedPurchaseloading: false,
        UnfixedPurchaseData: { ...action.payload },
      };
    },
    UnfixedPurchaseInformationFailure: (state, action) => {
      return {
        ...state,
        UnfixedPurchaseloading: false,
        UnfixedPurchaseerror: action.payload,
      };
    },
    recieptVoucherInformationTrigger(state, action) {
      return {
        ...state,
        receiptVoucherloading: action.payload,
      };
    },
    recieptVoucherInformationSuccess: (state, action) => {
      return {
        ...state,
        receiptVoucherloading: false,
        receiptVoucherData: { ...action.payload },
      };
    },
    recieptVoucherInformationFailure: (state, action) => {
      return {
        ...state,
        receiptVoucherloading: false,
        receiptVouchererror: action.payload,
      };
    },

    paymentVoucherInformationTrigger(state, action) {
      return {
        ...state,
        paymentVoucherloading: action.payload,
      };
    },
    paymentVoucherInformationSuccess: (state, action) => {
      return {
        ...state,
        paymentVoucherloading: false,
        paymentVoucherData: { ...action.payload },
      };
    },
    paymentVoucherInformationFailure: (state, action) => {
      return {
        ...state,
        paymentVoucherloading: false,
        paymentVouchererror: action.payload,
      };
    },

    clearData: (state, action) => {
      return {
        InvoiceDataViaPhn: [],
      };
    },
  },
});

export const {
  clearData,
  saveGoldFixingVoucherSuccess,
  saveGoldFixingVoucherTrigger,
  saveGoldFixingVoucherFailure,
  saveRecieptTrigger,
  saveRecieptFailure,
  saveRecieptSuccess,
  savePaymentFailure,
  savePaymentSuccess,
  savePaymentTrigger,
  savePettyCashVoucherSuccess,
  savePettyCashVoucherTrigger,
  savePettyCashVoucherFailure,

  purchaseGoldFixingVoucherSuccess,
  purchaseGoldFixingVoucherTrigger,
  purchaseGoldFixingVoucherFailure,
  recieptVoucherInformationTrigger,
  recieptVoucherInformationSuccess,
  recieptVoucherInformationFailure,
  paymentVoucherInformationTrigger,
  paymentVoucherInformationSuccess,
  paymentVoucherInformationFailure,
  UnfixedPurchaseInformationTrigger,
  UnfixedPurchaseInformationFailure,
  UnfixedPurchaseInformationSuccess,
  invoiceInformationFailure,
  invoiceInformationSuccess,
  invoiceInformationTrigger,
  scrapInvoiceInformationFailure,
  scrapInvoiceInformationSuccess,
  scrapInvoiceInformationTrigger,
  returnInvoiceTrigger,
  returnInvoiceSuccess,
  returnInvoiceFailure,
  tableDataTrigger,
  tableDataSuccess,
  tableDataFailure,
  againstInvoiceDataFailure,
  againstInvoiceDataSuccess,
  againstInvoiceDataTrigger,
  customInfoAccSuccess,
  customInfoAccTrigger,
  customInfoAccFailure,
  accountInfoTrigger,
  accountInfoSuccess,
  accountInfoFailure,
  InvoiceDataViaPhnTrigger,
  InvoiceDataViaPhnSuccess,
  InvoiceDataViaPhnFailure,
  setGlobalPopupVisibility,
  setGlobalPopupData,
  invoiceDetailsTrigger,
  invoiceDetailsSuccess,
  invoiceDetailsFailure,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
