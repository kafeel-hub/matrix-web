import { call, put, takeLatest } from "redux-saga/effects";
import {
  ItemInformationFailure,
  ItemInformationSuccess,
  ItemInformationTrigger,
  PartyInformationSuccess,
  PartyInformationTrigger,
  PartyInformationFailure,
  CustInfoByPhnTrigger,
  CustInfoByPhnSuccess,
  CustInfoByPhnFailure,
  currencyTrigger,
  currencySuccess,
  currencyFail,
  partyTrigger,
  partySuccess,
  partyFail,
  clearState,
} from "./demoSlice";
import Api from "../../services/ApiCaller";
import { getAccessToken } from "../../store/utilities";

export function* getItemInformation(api, { payload = {} }) {
  yield put(ItemInformationTrigger(true));
  try {
    const { CompanyId, ItemCode } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.itemInformation,
      { token, CompanyId, ItemCode },
      true
    );
    let itemDetails = {};
    if (result) {
      itemDetails = JSON.parse(result);
    }
    // console.log(itemDetails, "result get");

    yield put(ItemInformationSuccess(itemDetails));
  } catch (error) {
    yield put(ItemInformationFailure(error));
  } finally {
    yield put(ItemInformationTrigger(false));
  }
}
export function* getPartyInformation(api, { payload = {} }) {
  yield put(PartyInformationTrigger(true));
  try {
    const { CompanyId, partyId } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.partyInformation,
      { token, CompanyId, partyId },
      true
    );
    let partyDetails = {};
    if (result) {
      partyDetails = JSON.parse(result);
    }
    // console.log(partyDetails, "result get");

    yield put(PartyInformationSuccess(partyDetails));
  } catch (error) {
    yield put(PartyInformationFailure(error));
  } finally {
    yield put(PartyInformationTrigger(false));
  }
}
export function* getCustInfoByPhn(api, { payload = {} }) {
  yield put(CustInfoByPhnTrigger(true));
  try {
    const { CompanyId, strPhone, strCivilId } = payload;
    const token = yield getAccessToken();
    const result = yield call(
      Api.callServer,
      api.custInfo,
      { token, CompanyId, strPhone, strCivilId },
      true
    );
    let custDetailsViaPhn = {};
    if (result) {
      custDetailsViaPhn = JSON.parse(result);
    }
    // console.log(custDetailsViaPhn, "result get");

    yield put(CustInfoByPhnSuccess(custDetailsViaPhn));
  } catch (error) {
    yield put(CustInfoByPhnFailure(error));
  } finally {
    yield put(CustInfoByPhnTrigger(false));
  }
}

export function* getCurrency(api, { payload = {} }) {
  yield put(currencyTrigger(true));
  try {
    const { companyId } = payload;
    const token = yield getAccessToken();
    // console.log(token, "token");
    const result = yield call(
      Api.callServer,
      api.getCurrency,
      { token, companyId },
      true
    );
    let parseResult = [];
    if (result) {
      parseResult = JSON.parse(result);
    }
    yield put(currencySuccess(parseResult));
  } catch (error) {
    yield put(currencyFail(error));
  } finally {
    yield put(currencyTrigger(false));
  }
}
export function* getParty(api, { payload = {} }) {
  yield put(partyTrigger(true));
  try {
    const { companyId } = payload;
    const token = yield getAccessToken();
    // console.log(token, "token");
    const result = yield call(
      Api.callServer,
      api.getParty,
      { token, companyId },
      true
    );
    let parseResult = [];
    if (result) {
      parseResult = JSON.parse(result);
    }
    yield put(partySuccess(parseResult));
  } catch (error) {
    yield put(partyFail(error));
  } finally {
    yield put(partyTrigger(false));
  }
}
