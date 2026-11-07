// src/features/demo/demoSlice.js
import { createSlice } from "@reduxjs/toolkit";

const demoSlice = createSlice({
  name: "demo",
  initialState: {
    itemData: [],
    itemloading: false,
    itemerror: null,
    partyloading: false,
    partyerror: null,
    partyData: [],
    custInfoViaPhn: [],
    custInfoloading: false,
    custInfoerror: null,
    currencyList: [],
    currencyLoading: false,
    currencyError: undefined,
    partyList: [],
    partyLoading: false,
    partyError: undefined,
  },
  reducers: {
    ItemInformationTrigger(state, action) {
      return {
        ...state,
        itemloading: action.payload,
      };
    },
    ItemInformationSuccess: (state, action) => {
      return {
        ...state,
        itemloading: false,
        itemData: { ...action.payload },
      };
    },
    ItemInformationFailure: (state, action) => {
      return {
        ...state,
        itemloading: false,
        itemerror: action.payload,
      };
    },
    PartyInformationTrigger(state, action) {
      return {
        ...state,
        partyloading: action.payload,
      };
    },
    PartyInformationSuccess: (state, action) => {
      return {
        ...state,
        partyloading: false,
        partyData: { ...action.payload },
      };
    },
    PartyInformationFailure: (state, action) => {
      return {
        ...state,
        partyloading: false,
        partyerror: action.payload,
      };
    },
    CustInfoByPhnTrigger(state, action) {
      return {
        ...state,
        custInfoloading: action.payload,
      };
    },
    CustInfoByPhnSuccess: (state, action) => {
      return {
        ...state,
        custInfoloading: false,
        custInfoViaPhn: { ...action.payload },
      };
    },
    CustInfoByPhnFailure: (state, action) => {
      return {
        ...state,
        custInfoloading: false,
        custInfoerror: action.payload,
      };
    },
    currencyTrigger: (state, action) => {
      return {
        ...state,
        currencyLoading: action.payload,
      };
    },
    currencySuccess: (state, action) => {
      return {
        ...state,
        currencyList: action.payload,
      };
    },
    currencyFail: (state, action) => {
      return {
        currencyError: action.payload,
      };
    },
    partyTrigger: (state, action) => {
      return {
        ...state,
        partyLoading: action.payload,
      };
    },
    partySuccess: (state, action) => {
      return {
        ...state,
        partyList: action.payload,
      };
    },
    partyFail: (state, action) => {
      return {
        partyError: action.payload,
      };
    },
    clearData: (state, action) => {
      return {
        partyLoading: false,
        partyData: null,
        custInfoViaPhn: [],
      };
    },
  },
});

export const {
  clearState,
  currencyTrigger,
  currencySuccess,
  currencyFail,
  partyTrigger,
  partySuccess,
  partyFail,
  clearData,
  ItemInformationFailure,
  ItemInformationSuccess,
  ItemInformationTrigger,
  PartyInformationSuccess,
  PartyInformationTrigger,
  PartyInformationFailure,
  CustInfoByPhnTrigger,
  CustInfoByPhnSuccess,
  CustInfoByPhnFailure,
} = demoSlice.actions;

export default demoSlice.reducer;
