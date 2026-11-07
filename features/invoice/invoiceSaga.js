import { call, put, takeLatest } from "redux-saga/effects";
import {
  invoiceInformationFailure,
  invoiceInformationSuccess,
  invoiceInformationTrigger,
  scrapInvoiceInformationFailure,
  scrapInvoiceInformationSuccess,
  scrapInvoiceInformationTrigger,
  UnfixedPurchaseInformationTrigger,
  UnfixedPurchaseInformationFailure,
  UnfixedPurchaseInformationSuccess,
  recieptVoucherInformationTrigger,
  recieptVoucherInformationSuccess,
  recieptVoucherInformationFailure,
  paymentVoucherInformationTrigger,
  paymentVoucherInformationSuccess,
  paymentVoucherInformationFailure,
  returnInvoiceTrigger,
  returnInvoiceSuccess,
  returnInvoiceFailure,
  tableDataFailure,
  tableDataSuccess,
  tableDataTrigger,
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
  saveGoldFixingVoucherSuccess,
  saveGoldFixingVoucherTrigger,
  saveGoldFixingVoucherFailure,
  savePaymentSuccess,
  savePaymentTrigger,
  savePaymentFailure,
  saveRecieptSuccess,
  saveRecieptTrigger,
  saveRecieptFailure,
  savePettyCashVoucherSuccess,
  savePettyCashVoucherTrigger,
  savePettyCashVoucherFailure,
  purchaseGoldFixingVoucherSuccess,
  purchaseGoldFixingVoucherTrigger,
  purchaseGoldFixingVoucherFailure,
} from "./invoiceSlice";
import Api from "../../services/ApiCaller";
import { getAccessToken } from "../../store/utilities";
export function* setGlobalPopup(api, { payload = {} }) {
  yield put(setGlobalPopupVisibility(payload));
}
export function* saveInvoice(api, { payload = {} }) {
  yield put(invoiceInformationTrigger(true));
  try {
    const { strClsInventory, strPaymentTable, strTransactionTable, formSaved } =
      payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.saveInvoice,
      { token, strClsInventory, strPaymentTable, strTransactionTable },
      true
    );
    const { TranFinYear, TranType } = strClsInventory;

    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      ...result,
      TranFinYear,
      TranType,
    };
    yield put(invoiceInformationSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));
    yield put(
      setGlobalPopupData({
        title: "Retail Invoice Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(invoiceInformationFailure(error));
  } finally {
    yield put(invoiceInformationTrigger(false));
  }
}

export function* saveScrapPurchaseInvoice(api, { payload = {} }) {
  yield put(scrapInvoiceInformationTrigger(true));
  try {
    const { strClsInventory, strPaymentTable, strTransactionTable } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.saveScrapPurchaseInvoice,
      { token, strClsInventory, strPaymentTable, strTransactionTable },
      true
    );
    const { TranFinYear, TranType } = strClsInventory;

    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      ...result,
      TranFinYear,
      TranType,
    };
    yield put(scrapInvoiceInformationSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: "Scrap Purchase Invoice Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(scrapInvoiceInformationFailure(error));
  } finally {
    yield put(scrapInvoiceInformationTrigger(false));
  }
}
export function* saveUnfixedPurchaseInvoice(api, { payload = {} }) {
  yield put(UnfixedPurchaseInformationTrigger(true));
  try {
    const { strClsInventory, strTransactionTable } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.saveunfixedPurchase,
      { token, strClsInventory, strTransactionTable },
      true
    );
    const { TranFinYear, TranType } = strClsInventory;

    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      ...result,
      TranFinYear,
      TranType,
    };
    yield put(UnfixedPurchaseInformationSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: "Unfixed Purchase Invoice Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(UnfixedPurchaseInformationFailure(error));
  } finally {
    yield put(UnfixedPurchaseInformationTrigger(false));
  }
}
export function* saveRecieptVoucherInvoice(api, { payload = {} }) {
  yield put(recieptVoucherInformationTrigger(true));
  try {
    const { strClsInventory, strTransactionTable, strPaymentTable } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.saveRecieptVoucher,
      { token, strClsInventory, strTransactionTable, strPaymentTable },
      true
    );
    const { TranFinYear, TranType } = strClsInventory;

    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      ...result,
      TranFinYear,
      TranType,
    };
    yield put(recieptVoucherInformationSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: "Gold Receipt Voucher Invoice Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(recieptVoucherInformationFailure(error));
  } finally {
    yield put(recieptVoucherInformationTrigger(false));
  }
}
export function* savePaymentVoucherInvoice(api, { payload = {} }) {
  yield put(paymentVoucherInformationTrigger(true));
  try {
    const { strClsInventory, strTransactionTable, strPaymentTable } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.savePaymentVoucher,
      { token, strClsInventory, strTransactionTable, strPaymentTable },
      true
    );
    const { TranFinYear, TranType } = strClsInventory;

    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      ...result,
      TranFinYear,
      TranType,
    };
    yield put(paymentVoucherInformationSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: "Gold Payment Voucher Invoice Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(paymentVoucherInformationFailure(error));
  } finally {
    yield put(paymentVoucherInformationTrigger(false));
  }
}

export function* returnInvoice(api, { payload = {} }) {
  yield put(returnInvoiceTrigger(true));
  try {
    const {
      strClsInventory,
      strPaymentTable,
      strTransactionTable,
      setCurrentInvoice,
    } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.returnInvoice,
      { token, strClsInventory, strPaymentTable, strTransactionTable },
      true
    );
    const { TranFinYear, TranType } = strClsInventory;

    const updatedResult = {
      ...result,
      TranFinYear,
      TranType,
    };
    yield put(returnInvoiceSuccess(updatedResult));
    yield put(
      setGlobalPopupData({
        title: "Return Invoice Generated Successfully!",
      })
    );
    yield put(setGlobalPopupVisibility(true));
    if (result) {
      setCurrentInvoice(result);
      console.log(result, "return result");
    }
  } catch (error) {
    yield put(returnInvoiceFailure(error));
  } finally {
    yield put(returnInvoiceTrigger(false));
  }
}
export function* gettableData(api, { payload = {} }) {
  yield put(tableDataTrigger(true));
  try {
    const { CompanyId, LocationId, YearNo, invoiceType, TransDate } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getTableData,
      { token, CompanyId, LocationId, YearNo, invoiceType, TransDate },
      true
    );
    let itemDetails = [];
    if (result) {
      itemDetails = JSON.parse(result);
    }
    // console.log(itemDetails, "result get");

    yield put(tableDataSuccess(itemDetails));
  } catch (error) {
    yield put(tableDataFailure(error));
  } finally {
    yield put(tableDataTrigger(false));
  }
}

export function* getAgainstInvoice(api, { payload = {} }) {
  yield put(againstInvoiceDataTrigger(true));
  try {
    const { CompanyId, LocationId, YearNo, TransactionNo } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getAgainstInvoice,
      { token, CompanyId, LocationId, YearNo, TransactionNo },
      true
    );
    let itemDetails = [];
    if (result) {
      itemDetails = JSON.parse(result);
    }
    // console.log(itemDetails, "result get");

    yield put(againstInvoiceDataSuccess(itemDetails));
  } catch (error) {
    yield put(againstInvoiceDataFailure(error));
  } finally {
    yield put(againstInvoiceDataTrigger(false));
  }
}

export function* getCustomInfoAcc(api, { payload = {} }) {
  yield put(customInfoAccTrigger(true));
  try {
    const { CompanyId, LocationId, paidAccNo, civilId, mobile } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getCustomInfoAcc,
      { token, CompanyId, LocationId, paidAccNo, civilId, mobile },
      true
    );
    let itemDetails = [];
    if (result) {
      itemDetails = JSON.parse(result);
    }
    // console.log(itemDetails, "result get");

    yield put(customInfoAccSuccess(itemDetails));
  } catch (error) {
    yield put(customInfoAccFailure(error));
  } finally {
    yield put(customInfoAccTrigger(false));
  }
}

export function* getAccInfo(api, { payload = {} }) {
  yield put(accountInfoTrigger(true));
  try {
    const { CompanyId, LocationId, accountNo } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getAccountInfo,
      { token, CompanyId, LocationId, accountNo },
      true
    );
    let itemDetails = [];
    if (result) {
      itemDetails = JSON.parse(result);
    }
    // console.log(itemDetails, "result get");

    yield put(accountInfoSuccess(itemDetails));
  } catch (error) {
    yield put(accountInfoFailure(error));
  } finally {
    yield put(accountInfoTrigger(false));
  }
}
export function* getInvoiceViaPhn(api, { payload = {} }) {
  yield put(InvoiceDataViaPhnTrigger(true));
  try {
    const { CompanyId, LocationId, YearNo, mobile } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getInvoiceViaPhn,
      { token, CompanyId, LocationId, YearNo, mobile },
      true
    );
    let itemDetails = [];
    if (result) {
      itemDetails = JSON.parse(result);
    }
    // console.log(itemDetails, "result get");

    yield put(InvoiceDataViaPhnSuccess(itemDetails));
  } catch (error) {
    yield put(InvoiceDataViaPhnFailure(error));
  } finally {
    yield put(InvoiceDataViaPhnTrigger(false));
  }
}
export function* getInvoiceViaCivilId(api, { payload = {} }) {
  yield put(InvoiceDataViaPhnTrigger(true));
  try {
    const { CompanyId, LocationId, YearNo, civilId } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getInvoiceViaCivilId,
      { token, CompanyId, LocationId, YearNo, civilId },
      true
    );
    let itemDetails = [];
    if (result) {
      itemDetails = JSON.parse(result);
    }
    // console.log(itemDetails, "result get");

    yield put(InvoiceDataViaPhnSuccess(itemDetails));
  } catch (error) {
    yield put(InvoiceDataViaPhnFailure(error));
  } finally {
    yield put(InvoiceDataViaPhnTrigger(false));
  }
}
export function* getInvoiceDetails(api, { payload = {} }) {
  yield put(invoiceDetailsTrigger(true));
  try {
    // const { CompanyId, LocationId, YearNo } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getInvoiceDetails,
      { token, ...payload },
      true
    );
    let itemDetails = [];
    if (result) {
      itemDetails = JSON.parse(result);
    }
    // console.log(itemDetails, "result get");

    yield put(invoiceDetailsSuccess(itemDetails));
  } catch (error) {
    yield put(invoiceDetailsFailure(error));
  } finally {
    yield put(invoiceDetailsTrigger(false));
  }
}
export function* saveGoldFixingVoucher(api, { payload = {} }) {
  yield put(saveGoldFixingVoucherTrigger(true));
  try {
    const {
      strClsInventory,
      strPaymentTable,
      // strTransactionTable,
      setCurrentInvoice,
    } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.saveGoldFixingVoucher,
      { token, strClsInventory, strPaymentTable },
      true
    );
    // console.log(result, "return result");
    const { TranFinYear, TranType } = strClsInventory;
    // if (result) {
    //   setCurrentInvoice(result);
    // }
    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      result,
      TranFinYear,
      TranType,
    };
    yield put(saveGoldFixingVoucherSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: "Gold Fixing Voucher Invoice Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(saveGoldFixingVoucherFailure(error));
  } finally {
    yield put(saveGoldFixingVoucherTrigger(false));
  }
}
export function* saveRecieptVoucher(api, { payload = {} }) {
  yield put(saveRecieptTrigger(true));
  try {
    const {
      strClsAccount,
      strPaymentTable,
      CompanyId,
      FinYear,
      LocationId,
      setCurrentInvoice,
    } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.saveReciept,
      { token, CompanyId, FinYear, LocationId, strClsAccount, strPaymentTable },
      true
    );
    // console.log(result, "return result");
    // const { TranFinYear, TranType } = strClsInventory;
    // if (result) {
    //   setCurrentInvoice(result);
    // }
    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      result,
      CompanyId,
      FinYear,
      LocationId,
      // TranFinYear,
      // TranType,
    };
    yield put(saveRecieptSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: "Reciept Voucher Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(saveRecieptFailure(error));
  } finally {
    yield put(saveRecieptTrigger(false));
  }
}
export function* savePaymentVoucher(api, { payload = {} }) {
  yield put(savePaymentTrigger(true));
  try {
    const { strClsAccount, strPaymentTable, CompanyId, FinYear, LocationId } =
      payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.savePayment,
      { token, strClsAccount, strPaymentTable, CompanyId, FinYear, LocationId },
      true
    );

    // const { TranFinYear, TranType } = strClsInventory;

    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      result,
      CompanyId,
      FinYear,
      LocationId,
    };
    yield put(savePaymentSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: "Payment Voucher Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(savePaymentFailure(error));
  } finally {
    yield put(savePaymentTrigger(false));
  }
}

export function* savePettyCashVoucher(api, { payload = {} }) {
  yield put(savePettyCashVoucherTrigger(true));
  try {
    const { strClsAccount, CompanyId, FinYear, LocationId, dtRow } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.savePettyCashVoucher,
      {
        token,
        CompanyId,
        FinYear,
        LocationId,
        strClsAccount,
        dtRow,
      },
      true
    );
    // console.log(result, "return result");
    // const { TranFinYear, TranType } = strClsInventory;
    // if (result) {
    //   setCurrentInvoice(result);
    // }
    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      result,
      CompanyId,
      FinYear,
      LocationId,
    };
    yield put(savePettyCashVoucherSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: "Gold PettyCash Voucher Invoice Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(savePettyCashVoucherFailure(error));
  } finally {
    yield put(savePettyCashVoucherTrigger(false));
  }
}

export function* purchaseGoldFixingVoucher(api, { payload = {} }) {
  yield put(purchaseGoldFixingVoucherTrigger(true));
  try {
    const {
      strClsInventory,
      strPaymentTable,
      // strTransactionTable,
      setCurrentInvoice,
    } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.PurchaseGoldFixingVoucher,
      { token, strClsInventory, strPaymentTable },
      true
    );
    // console.log(result, "return result");
    const { TranFinYear, TranType } = strClsInventory;
    // if (result) {
    //   setCurrentInvoice(result);
    // }
    // Add InvFinYear and InvType to the result payload
    const updatedResult = {
      result,
      TranFinYear,
      TranType,
    };
    yield put(purchaseGoldFixingVoucherSuccess(updatedResult));
    yield put(setGlobalPopupVisibility(true));

    yield put(
      setGlobalPopupData({
        title: " Purchase Gold Fixing Voucher Invoice Generated Successfully!",
      })
    );
  } catch (error) {
    yield put(purchaseGoldFixingVoucherFailure(error));
  } finally {
    yield put(purchaseGoldFixingVoucherTrigger(false));
  }
}
