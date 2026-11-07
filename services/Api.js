import axios from "axios";
import store from "../store";
const baseUrl =
  // import.meta.env.VITE_API_BASE_URL ||s
  // "http://bestojewelapi-dev.us-east-1.elasticbeanstalk.com/api";
  // "https://103.74.54.206/api";
  "https://golderp.haleemakwt.com/api";

const create = (baseURL = baseUrl) => {
  const apis = axios.create({
    baseURL,
    headers: {
      "Cache-Control": "no-cache",
    },
    timeout: 200000,
  });

  const getDemo = (data) => {
    return apis.get(`/users`);
  };
  const logIn = (data) => {
    return apis.post("/User/AuthenticateUser", data);
  };

  const getCompanylist = (data) => {
    return apis.get(
      `/Inventory/GetUserCompanyList?userId=${data?.userId}`,

      { headers: { Authorization: `Bearer ${data?.token}` } },
    );
  };

  const getCompanyLocation = (data) => {
    return apis.get(
      `/Inventory/GetCompanyLocationList?UserId=${data?.userId}&CompanyId=${data.companyId}`,
      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const getCompanyDetails = (data) => {
    return apis.get(
      `/Inventory/GetCompanyLocation?UserId=${data?.userId}&CompanyId=${data.companyId}&LocationId=${data.locationId}`,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const comboBox = (data) => {
    return apis.get(
      `/Inventory/FillComboBox?CompanyId=${data?.companyId}&LocId=${data?.locationId}&QueryType=${
        data.QueryType
      }&ConditionString=${data.ConditionString || ""}`,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const itemInformation = (data) => {
    return apis.get(
      // `/Inventory/GetItemInformation?CompanyId=${
      //   data?.CompanyId
      // }&LocationId=${0}&ItemCode=${data?.ItemCode}`,
      `/Inventory/GetItemInfoForInvoice?CompanyId=${data?.CompanyId}&ItemCode=${data?.ItemCode}`,
      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const partyInformation = (data) => {
    return apis.get(
      `/Inventory/GetPartyDetail?CompanyId=${data?.CompanyId}&PartyId=${data?.partyId}`,
      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const custInfo = (data) => {
    return apis.get(
      `/Inventory/GetCustomerByMobileCivilID?CompanyId=${
        data?.CompanyId
      }&strCivilId=${data?.strCivilId || 0}&strPhone=${data?.strPhone || 0}`,
      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const saveInvoice = (data) => {
    return apis.post(
      `/inventory/GoldSave_SalesInvoice`,
      data,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const saveScrapPurchaseInvoice = (data) => {
    return apis.post(
      `/inventory/GoldSave_ScrapPurchaseInvoice`,
      data,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const saveunfixedPurchase = (data) => {
    return apis.post(
      `/Inventory/GoldSave_UnfixedPurchaseInvoice`,
      data,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const saveRecieptVoucher = (data) => {
    return apis.post(
      `/inventory/Gold_ReceiptVoucherSave`,
      data,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };

  const saveReciept = (data) => {
    return apis.post(
      `/inventory/ReceiptPaymentVoucherSave`,
      data,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const savePayment = (data) => {
    return apis.post(
      `/inventory/CashPaymentVoucherSave`,
      data,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const savePaymentVoucher = (data) => {
    return apis.post(
      `/inventory/Gold_PaymentVoucherSave`,
      data,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };

  const returnInvoice = (data) => {
    console.log(data, "api data");
    return apis.post(`/inventory/GoldSave_SalesReturn`, data, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };
  const saveGoldFixingVoucher = (data) => {
    return apis.post(`/inventory/SalesGoldFixingVoucherSave`, data, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };
  const savePettyCashVoucher = (data) => {
    return apis.post(`/inventory/PettyExpenseVoucherSave`, data, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };

  const PurchaseGoldFixingVoucher = (data) => {
    return apis.post(`/inventory/PurchaseGoldFixingVoucherSave`, data, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };

  const getTableData = (data) => {
    const Url =
      data.invoiceType === "GFS"
        ? `/Inventory/SalesGoldFixingVoucherList?CompanyId=${data?.CompanyId}&TransDate=${data.TransDate}&LocationId=${data.LocationId}&YearNo=${data.YearNo}&TranType=${data.invoiceType}`
        : data.invoiceType === "GFP"
          ? `/Inventory/PurchaseGoldFixingVoucherList?CompanyId=${data?.CompanyId}&TransDate=${data.TransDate}&LocationId=${data.LocationId}&YearNo=${data.YearNo}&TranType=${data.invoiceType}`
          : `/Inventory/GetTransactionHeadList?CompanyId=${data?.CompanyId}&TransDate=${data.TransDate}&LocationId=${data.LocationId}&YearNo=${data.YearNo}&TransactionType=${data.invoiceType}`;
    return apis.get(
      Url,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const getCurrency = (data) => {
    return apis.get(`/Inventory/GetCurrency?CompanyId=${data.companyId}`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };
  const getParty = (data) => {
    return apis.get(`/Inventory/GetPartyList?CompanyId=${data.companyId}`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };
  const getAgainstInvoice = (data) => {
    return apis.get(
      `Inventory/GetInvoiceRetrive?CompanyId=${data?.CompanyId}&LocationId=${data.LocationId}&YearNo=${data.YearNo}&TransactionType=GSAL&TransactionNo=${data.TransactionNo}&MachineNo=0
      `,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const getCustomInfoAcc = (data) => {
    return apis.get(
      `Inventory/GetCreditCustomerInfo?CompanyId=${
        data?.CompanyId
      }&LocationId=${data.LocationId}&PrtId=${data.paidAccNo}&CustCivilId=${
        data.civilId || ""
      }&CustPhone=${data.mobile || ""}
      `,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const getAccountInfo = (data) => {
    return apis.get(
      `Inventory/GetCustomerAccountInfo?CompanyId=${data?.CompanyId}&LocationId=${data.LocationId}&PayActNo=${data.accountNo} `,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const getInvoiceViaPhn = (data) => {
    return apis.get(
      `Inventory/GetInvoiceByMobile?CompanyId=${data?.CompanyId}&LocationId=${data.LocationId}&YearNo=${data.YearNo}&TransactionType=GSAL&custMobile=${data.mobile}&MachineNo=0
      `,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const getInvoiceViaCivilId = (data) => {
    return apis.get(
      `Inventory/GetInvoiceByCivilId?CompanyId=${data?.CompanyId}&LocationId=${data.LocationId}&YearNo=${data.YearNo}&TransactionType=GSAL&custCivilId=${data.civilId}&MachineNo=0
      `,

      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };
  const getInvoiceDetails = (data) => {
    const Url =
      data?.TransactionType == "GFS"
        ? `/Inventory/SalesGoldFixingVoucherRetrieve?CompanyId=${data?.CompanyId}&LocationId=${data.LocationId}&FinYear=${data.YearNo}&TranType=${data.TransactionType}&TranNo=${data.TransactionNo}&VrRefNo=${data.MachineNo}`
        : data?.TransactionType == "GFP"
          ? `/Inventory/PurchaseGoldFixingVoucherRetrieve?CompanyId=${data?.CompanyId}&LocationId=${data.LocationId}&FinYear=${data.YearNo}&TranType=${data.TransactionType}&TranNo=${data.TransactionNo}&VrRefNo=${data.MachineNo}`
          : `/Inventory/GetInvoiceRetrive?CompanyId=${data?.CompanyId}&LocationId=${data.LocationId}&YearNo=${data.YearNo}&TransactionType=${data.TransactionType}&TransactionNo=${data.TransactionNo}&MachineNo=${data.MachineNo}`;
    return apis.get(Url, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };

  const getMasterTableData = (data) => {
    return apis.get(`/Inventory/${data.type}?CompanyId=${data?.CompanyId}`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };

  const addMasterData = (data) => {
    return apis.post(`/inventory/${data.type}`, data.data, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
  };

  const getCreditCustomerInfo = (data) => {
    return apis.get(
      `/Inventory/GetCreditCustomerInfo?CompanyId=${data.companyId}&LocationId=${data.locationId}&PrtId=${data.prtId}&CustCivilId=${data.custCivilId}&CustPhone=`,
      { headers: { Authorization: `Bearer ${data.token}` } },
    );
  };

  return {
    getDemo,
    logIn,
    getCompanylist,
    getCompanyLocation,
    getCompanyDetails,
    comboBox,
    itemInformation,
    partyInformation,
    custInfo,
    saveInvoice,
    getTableData,
    saveScrapPurchaseInvoice,
    getAgainstInvoice,
    getCustomInfoAcc,
    getAccountInfo,
    getInvoiceViaPhn,
    getInvoiceViaCivilId,
    getCurrency,
    getParty,
    getInvoiceDetails,
    returnInvoice,
    saveunfixedPurchase,
    saveRecieptVoucher,
    saveReciept,
    savePayment,
    savePaymentVoucher,
    saveGoldFixingVoucher,
    savePettyCashVoucher,
    PurchaseGoldFixingVoucher,
    getMasterTableData,
    addMasterData,
    getCreditCustomerInfo,
  };
};
export default {
  create,
};
