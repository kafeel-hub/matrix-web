import { all, takeEvery, takeLatest } from "redux-saga/effects";
import Api from "../services/Api";
import {
  signIn,
  signUp,
  logout,
  getCompanylist,
  getCompanyBranchlist,
  getCompanyDetails,
} from "../features/auth/authSaga";
import {
  getItemInformation,
  getPartyInformation,
  getCustInfoByPhn,
  getCurrency,
  getParty,
} from "../features/demo/demoSaga";
import {
  saveInvoice,
  gettableData,
  setGlobalPopup,
  saveScrapPurchaseInvoice,
  getAgainstInvoice,
  getCustomInfoAcc,
  getAccInfo,
  getInvoiceViaPhn,
  getInvoiceViaCivilId,
  getInvoiceDetails,
  returnInvoice,
  saveUnfixedPurchaseInvoice,
  saveRecieptVoucherInvoice,
  savePaymentVoucherInvoice,
  saveGoldFixingVoucher,
  saveRecieptVoucher,
  savePaymentVoucher,
  savePettyCashVoucher,
  purchaseGoldFixingVoucher,
} from "../features/invoice/invoiceSaga";
import {
  getMasterTableData,
  addMasterData,
  getCreditCustomerDetail,
} from "../features/master/customerSaga";

const api = Api.create();
export { api };
export default function* root() {
  yield all([
    // takeEvery("getdemoSagacalled", getdemoSaga, api),
    takeEvery("signInCalled", signIn, api),
    takeLatest("signUpCalled", signUp, api),
    takeLatest("logoutCalled", logout, api),
    takeEvery("getCompanylistcalled", getCompanylist, api),
    takeEvery("getCompanyBranchlistcalled", getCompanyBranchlist, api),
    takeEvery("getCompanyDetailscalled", getCompanyDetails, api),
    takeEvery("getCurrencycalled", getCurrency, api),
    takeEvery("getPartycalled", getParty, api),

    takeLatest("saveInvoicecalled", saveInvoice, api),
    takeLatest(
      "saveUnfixedPurchaseInvoicecalled",
      saveUnfixedPurchaseInvoice,
      api
    ),
    takeLatest(
      "saveRecieptVoucherInvoicecalled",
      saveRecieptVoucherInvoice,
      api
    ),
    takeLatest(
      "savePaymentVoucherInvoicecalled",
      savePaymentVoucherInvoice,
      api
    ),

    takeLatest("saveScrapPurchaseInvoicecalled", saveScrapPurchaseInvoice, api),
    takeLatest("saveGoldFixingVouchercalled", saveGoldFixingVoucher, api),
    takeLatest("saveRecieptVouchercalled", saveRecieptVoucher, api),
    takeLatest("savePaymentVouchercalled", savePaymentVoucher, api),

    takeLatest("savePettyCashVouchercalled", savePettyCashVoucher, api),
    takeLatest(
      "purchaseGoldFixingVouchercalled",
      purchaseGoldFixingVoucher,
      api
    ),

    takeLatest("returnInvoicecalled", returnInvoice, api),

    takeLatest("getItemInformationcalled", getItemInformation, api),
    takeLatest("getPartyInformationcalled", getPartyInformation, api),
    takeLatest("getCustInfoByPhncalled", getCustInfoByPhn, api),

    takeLatest("gettableDatacalled", gettableData, api),
    takeLatest("getAgainstInvoicecalled", getAgainstInvoice, api),
    takeLatest("getCustomInfoAcccalled", getCustomInfoAcc, api),
    takeLatest("getAccInfocalled", getAccInfo, api),

    takeLatest("getInvoiceViaPhncalled", getInvoiceViaPhn, api),
    takeLatest("getInvoiceViaCivilIdcalled", getInvoiceViaCivilId, api),

    takeLatest("setglobalpopupcalled", setGlobalPopup, api),

    takeLatest("getInvoiceDetailscalled", getInvoiceDetails, api),

    takeLatest("getMasterTableDataCalled", getMasterTableData, api),
    takeLatest("addMasterDataCalled", addMasterData, api),

    takeLatest("getCreditCustomerDetailCalled", getCreditCustomerDetail, api),
  ]);
}
