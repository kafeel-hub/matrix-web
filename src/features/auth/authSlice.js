import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tenantKey: "",
  preAuthToken: null,
  requiresContextSelection: false,
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAtUtc: null,
  refreshTokenExpiresAtUtc: null,
  token: null,
  user: null,
  userName: "",
  companies: [],
  companyList: [],
  companyBranchList: [],
  context: null,
  modules: null,
  permissions: [],
  lookups: null,
  CompanyDetails: [],
  comboBox: {},
  authData: {},
  signInLoading: false,
  signInError: "",
  companyBranchListLoading: false,
  CompanyDetailsLoading: false,
  CompanyDetailsError: "",
};

const toLegacyCompanyList = (companies = []) => companies.map((x) => ({ fldID: x.companyId, fldDisplay: x.companyName }));
const toLegacyLocationList = (locations = []) => locations.map((x) => ({ fldID: x.locationId, fldDisplay: x.locationName }));

const toLegacyComboBox = (lookups = {}) => ({
  salesman: (lookups.salesmen || []).map((x) => ({ fldID: x.id, fldDisplay: x.name })),
  paytype: (lookups.paymentTypes || []).map((x) => ({ fldID: x.id, fldDisplay: x.name, typeFlag: x.typeFlag })),
  area: (lookups.areas || []).map((x) => ({ fldID: x.id, fldDisplay: x.name })),
  country: (lookups.nationalities || []).map((x) => ({ fldID: x.id, fldDisplay: x.name })),
  currency: (lookups.currencies || []).map((x) => ({ fldID: x.id, fldDisplay: x.name, rate: x.rate, decimalPlaces: x.decimalPlaces })),
});
const toLegacyCompanyDetails = (context) => context ? [{
  CompanyName: context.companyName,
  LocName: context.locationName,
  FinancialYear: context.financialYear?.yearNo,
}] : [];

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginTrigger(state, action) { state.signInLoading = action.payload; if (action.payload) state.signInError = ""; },
    loginFail(state, action) { state.signInError = action.payload || "Login failed."; state.signInLoading = false; },
    loginRequiresContext(state, action) {
      const { tenantKey, response } = action.payload;
      state.tenantKey = tenantKey;
      state.preAuthToken = response.preAuthToken;
      state.requiresContextSelection = true;
      state.user = response.user;
      state.userName = response.user?.userName || response.user?.loginName || "";
      state.companies = response.companies || [];
      state.companyList = toLegacyCompanyList(response.companies);
      state.accessToken = null; state.refreshToken = null; state.token = null;
    },
    authenticated(state, action) {
      const { tenantKey, response } = action.payload;
      state.tenantKey = tenantKey || state.tenantKey;
      state.preAuthToken = null;
      state.requiresContextSelection = false;
      state.accessToken = response.accessToken;
      state.refreshToken = response.refreshToken;
      state.accessTokenExpiresAtUtc = response.accessTokenExpiresAtUtc;
      state.refreshTokenExpiresAtUtc = response.refreshTokenExpiresAtUtc;
      state.token = response.accessToken; // compatibility while other screens are migrated
      state.user = response.user;
      state.userName = response.user?.userName || response.user?.loginName || "";
      state.companies = response.companies || state.companies || [];
      state.companyList = toLegacyCompanyList(state.companies);
      state.context = response.context;
      state.modules = response.modules;
      state.permissions = response.permissions || [];
      state.lookups = response.lookups;
      state.CompanyDetails = toLegacyCompanyDetails(response.context);
      state.companyBranchList = response.context ? [{ fldID: response.context.locationId, fldDisplay: response.context.locationName }] : state.companyBranchList;
      state.comboBox = toLegacyComboBox(response.lookups || {});
      state.authData = {
        accessToken: response.accessToken,
        companyId: response.context?.companyId,
        locationId: response.context?.locationId,
        companyDetails: toLegacyCompanyDetails(response.context),
        financialYear: response.context?.financialYear,
        modules: response.modules,
        permissions: response.permissions || [],
      };
      state.signInError = "";
      state.signInLoading = false;
      state.CompanyDetailsLoading = false;
    },
    sessionRefreshed(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.accessTokenExpiresAtUtc = action.payload.accessTokenExpiresAtUtc;
      state.refreshTokenExpiresAtUtc = action.payload.refreshTokenExpiresAtUtc;
      state.token = action.payload.accessToken;
      state.authData = { ...state.authData, accessToken: action.payload.accessToken };
    },
    companyBranchListSuccess(state, action) { state.companyBranchList = action.payload || []; state.companyBranchListLoading = false; },
    companyBranchListTrigger(state, action) { state.companyBranchListLoading = action.payload; },
    CompanyDetailsTrigger(state, action) { state.CompanyDetailsLoading = action.payload; if (action.payload) state.CompanyDetailsError = ""; },
    CompanyDetailsFail(state, action) { state.CompanyDetailsError = action.payload || "Context selection failed."; state.CompanyDetailsLoading = false; },
    logOut() { return { ...initialState }; },
    // Compatibility reducers retained while non-dashboard modules still use the old integration.
    setCredential() {}, loginSuccess() {}, companyListFail() {}, companyListTrigger() {}, companyListSuccess(state, action) { state.companyList = action.payload || []; },
    companyBranchListFail(state, action) { state.CompanyDetailsError = action.payload; state.companyBranchListLoading = false; },
    CompanyDetailsSuccess() {}, comboBoxSuccess(state, action) { state.comboBox = action.payload || {}; },
    signUpTrigger() {}, signupSuccess() {}, signupFail() {},
  },
});

export const { loginTrigger, loginFail, loginRequiresContext, authenticated, sessionRefreshed,
  companyBranchListSuccess, companyBranchListTrigger, CompanyDetailsTrigger, CompanyDetailsFail,
  logOut, setCredential, loginSuccess, companyListFail, companyListTrigger, companyListSuccess,
  companyBranchListFail, CompanyDetailsSuccess, comboBoxSuccess, signUpTrigger, signupSuccess, signupFail } = authSlice.actions;
export default authSlice.reducer;
