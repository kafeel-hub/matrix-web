import { call, put } from "redux-saga/effects";
import {
  loginTrigger, loginFail, loginRequiresContext, authenticated,
  companyBranchListSuccess, companyBranchListTrigger,
  CompanyDetailsTrigger, CompanyDetailsFail, logOut,
} from "./authSlice";
import * as authApi from "../../services/matrixAuthApi";

export function* signIn(_api, { payload = {} }) {
  yield put(loginTrigger(true));
  const { UserName, UserPassword, ClientCode, navigate } = payload;
  try {
    const tenantKey = (ClientCode || "").trim();
    const response = yield call(authApi.login, { tenantKey, userName: UserName, password: UserPassword });
    if (!response?.succeeded) throw new Error(response?.error || "Login failed.");

    if (response.requiresContextSelection) {
      yield put(loginRequiresContext({ tenantKey, response }));
      navigate("/company-branch");
      return;
    }

    yield put(authenticated({ tenantKey, response }));
    navigate("/dashboard");
  } catch (error) {
    yield put(loginFail(error?.message || "Unable to sign in."));
  } finally {
    yield put(loginTrigger(false));
  }
}

export function* getCompanyBranchlist(_api, { payload = {} }) {
  yield put(companyBranchListTrigger(true));
  try {
    // Company/location access already comes from POST /api/auth/login.
    const locations = payload.locations || [];
    yield put(companyBranchListSuccess(locations.map((x) => ({ fldID: x.locationId, fldDisplay: x.locationName }))));
  } finally {
    yield put(companyBranchListTrigger(false));
  }
}

export function* getCompanyDetails(_api, { payload = {} }) {
  yield put(CompanyDetailsTrigger(true));
  try {
    const { tenantKey, preAuthToken, companyId, locationId, navigate } = payload;
    const response = yield call(authApi.selectContext, { tenantKey, preAuthToken, companyId, locationId });
    if (!response?.succeeded) {
      const error = new Error(response?.error || "Context selection failed.");
      error.code = response?.errorCode || null;
      throw error;
    }
    yield put(authenticated({ tenantKey, response }));
    navigate("/dashboard");
  } catch (error) {
    if (error?.code === "PREAUTH_INVALID") {
      // The company/location screen cannot recover once its one-time ticket has genuinely
      // expired or been consumed. Clear stale auth state and return to credential login.
      yield put(logOut());
      navigate("/");
      return;
    }
    yield put(CompanyDetailsFail(error?.message || "Unable to select company/location."));
  } finally {
    yield put(CompanyDetailsTrigger(false));
  }
}

export function* logout(_api, { payload = {} }) {
  try {
    const { tenantKey, refreshToken } = payload || {};
    if (tenantKey && refreshToken) {
      try { yield call(authApi.logout, { tenantKey, refreshToken }); } catch { /* local logout still proceeds */ }
    }
  } finally {
    yield put(logOut());
    payload?.navigate?.("/");
  }
}

// Old auth lookup operations are intentionally no-ops in the new flow.
export function* signUp() {}
export function* getCompanylist() {}
