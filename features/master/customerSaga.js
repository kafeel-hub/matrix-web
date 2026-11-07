import { call, put, takeLatest } from "redux-saga/effects";
import {masterTableDataTrigger,masterTableDataSuccess,masterTableDataFailure,saveMasterDataTrigger,
  saveMasterDataSuccess,saveMasterDataFailure, creditCustomerInfoTrigger,creditCustomerInfoSuccess,creditCustomerInfoFailure } from "./customerSlice";
import Api from "../../services/ApiCaller";
import { getAccessToken } from "../../store/utilities";

export function* setGlobalPopup(api, { payload = {} }) {
  yield put(setGlobalPopupVisibility(payload));
}
export function* getMasterTableData(api, { payload = {} }) {
  yield put(masterTableDataTrigger(true));
  try {
    const { CompanyId,type } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getMasterTableData,
      { token, CompanyId,type},
      true
    );
    let customerData = [];
    if (result) {
      customerData = JSON.parse(result);
    }
    console.log(customerData, "result get");

    yield put(masterTableDataSuccess(customerData));
  } catch (error) {
    yield put(masterTableDataFailure(error));
  } finally {
    yield put(masterTableDataTrigger(false));
  }
}


export function* addMasterData(api, { payload = {} }) {
  yield put(saveMasterDataTrigger(true));
  try {
    const { data,type,setModalOpen,CompanyId,getParams } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.addMasterData,
      { token, data,type },
      true
    );
    yield put(saveMasterDataSuccess(result));
    yield call(getMasterTableData, api, { payload: { CompanyId: CompanyId, type:getParams } });
    
    setModalOpen(false)
    // yield put(setGlobalPopupVisibility(true));
    // yield put(
    //   setGlobalPopupData({
    //     title: "Master Data is added.",
    //   })
    // );
  } catch (error) {
    yield put(saveMasterDataFailure(error));
  } finally {
    yield put(saveMasterDataTrigger(false));
  }
}

export function* getCreditCustomerDetail(api, { payload = {} }) {
  yield put(creditCustomerInfoTrigger(true));
  try {
    const {setFormData} = payload
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.getCreditCustomerInfo,
      { token, ...payload},
      true
    );
    let customerData = [];
    if (result) {
      customerData = JSON.parse(result);
    }

    setFormData((prev) => ({
      ...prev,
      clCode: parseInt(payload.prtId),
      clActNo: parseInt(payload.prtId)
    }));
    console.log(customerData, "result get");

    yield put(creditCustomerInfoSuccess(customerData));
  } catch (error) {
    yield put(creditCustomerInfoFailure(error));
  } finally {
    yield put(creditCustomerInfoTrigger(false));
  }
}


