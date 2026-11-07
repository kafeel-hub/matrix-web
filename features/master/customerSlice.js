// src/features/demo/demoSlice.js
import { createSlice } from "@reduxjs/toolkit";

const customerSlice = createSlice({
  name: "master",
  initialState: {
    masterTablesDataLoading: false,
    masterTableData: [],
    masterTableDataError: null,
    addMasterDataLoading :false,
    creditCustomerLoading:false,
    creditCustomerInfo:{},
    creditCustomerError:null,
    

  },
  reducers: {
    masterTableDataTrigger(state, action) {
      return {
        ...state,
        masterTablesDataLoading: action.payload,
      };
    },
    masterTableDataSuccess: (state, action) => {
      return {
        ...state,
        masterTablesDataLoading: false,
        masterTableData: Array.isArray(action.payload) ? [...action.payload] : action.payload,
      };
    },
    
    masterTableDataFailure: (state, action) => {
      return {
        ...state,
        masterTablesDataLoading: false,
        masterTableDataError: action.payload,
      };
    },


    saveMasterDataTrigger(state, action) {
      return {
        ...state,
        addMasterDataLoading: action.payload,
      };
    },
    saveMasterDataSuccess: (state, action) => {
      return {
        ...state,
        addMasterDataLoading: false,
        addMasterData: { ...action.payload },
      };
    },
    saveMasterDataFailure: (state, action) => {
      return {
        ...state,
        addMasterDataLoading: false,
        addMasterDataError: action.payload,
      };
    },

    creditCustomerInfoTrigger(state, action) {
      return {
        ...state,
        creditCustomerLoading: action.payload,
      };
    },
    creditCustomerInfoSuccess: (state, action) => {
      return {
        ...state,
        creditCustomerLoading: false,
        creditCustomerInfo: [ ...action.payload ],
      };
    },
    creditCustomerInfoFailure: (state, action) => {
      return {
        ...state,
        creditCustomerLoading: false,
        creditCustomerError: action.payload,
      };
    },

  },
});

export const {
    masterTableDataTrigger,
    masterTableDataSuccess,
    masterTableDataFailure,
    saveMasterDataTrigger,
    saveMasterDataSuccess,
    saveMasterDataFailure,
    creditCustomerInfoTrigger,
    creditCustomerInfoSuccess,
    creditCustomerInfoFailure
} = customerSlice.actions;

export default customerSlice.reducer;
