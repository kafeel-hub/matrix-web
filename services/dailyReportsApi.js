import { refresh as refreshSession } from "./matrixAuthApi";
const base=(import.meta.env.VITE_MATRIX_API_BASE_URL||"/api").replace(/\/$/,"");
const query=(p)=>{const q=new URLSearchParams();Object.entries(p).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=="")q.set(k,v)});return q.toString()};
const message=async(r)=>{try{const b=await r.json();return b?.message||b?.detail||b?.title||`Report request failed (${r.status})`}catch{return `Report request failed (${r.status})`}};
let refreshing=null;
const get=async(path,session,signal,onSessionRefreshed)=>{
  const call=(token)=>fetch(`${base}${path}`,{headers:{Accept:"application/json","X-Tenant-Key":session.tenantKey,Authorization:`Bearer ${token}`},signal});
  let r=await call(session.accessToken);
  if(r.status===401&&session.refreshToken){
    if(!refreshing) refreshing=refreshSession({tenantKey:session.tenantKey,refreshToken:session.refreshToken}).finally(()=>{refreshing=null});
    const t=await refreshing;if(!t?.succeeded)throw new Error(t?.error||"Your session has expired.");onSessionRefreshed?.(t);r=await call(t.accessToken);
  }
  if(!r.ok)throw new Error(await message(r));return r.json();
};
export const getDailyActivity=({fromDate,toDate,transactionType,session,signal,onSessionRefreshed})=>
  get(`/reports/daily/activity/details?${query({fromDate,toDate,transactionType})}`,session,signal,onSessionRefreshed);
export const getDailyReport=({fromDate,toDate,session,signal,onSessionRefreshed})=>
  get(`/reports/daily/report?${query({fromDate,toDate})}`,session,signal,onSessionRefreshed);

const DAILY_SALES_TYPES=["GSAL","GRET","USAL","UGLP"];
export const getDailySales=async({fromDate,toDate,transactionType,session,signal,onSessionRefreshed})=>{
  const selected=transactionType?[transactionType]:DAILY_SALES_TYPES;
  const results=await Promise.all(selected.map(type=>getDailyActivity({fromDate,toDate,transactionType:type,session,signal,onSessionRefreshed})));
  const rows=results.flatMap(x=>x?.rows||[]);
  const sum=k=>results.reduce((a,x)=>a+Number(x?.totals?.[k]||0),0);
  return {
    rows,
    totals:{
      transactions:sum("transactions"),lines:sum("lines"),quantity:sum("quantity"),
      grossWeight:sum("grossWeight"),stoneWeight:sum("stoneWeight"),goldWeight:sum("goldWeight"),
      pureWeight:sum("pureWeight"),lineAmount:sum("lineAmount")
    }
  };
};

export const getDailySalesPayments=({fromDate,toDate,transactionType,paymentClass,session,signal,onSessionRefreshed})=>
  get(`/reports/daily/sales/payments?${query({fromDate,toDate,transactionType,paymentClass})}`,session,signal,onSessionRefreshed);

export const getDailyPayments=({fromDate,toDate,session,signal,onSessionRefreshed})=>
  get(`/reports/daily/payments?${query({fromDate,toDate})}`,session,signal,onSessionRefreshed);


export const getDailyCashBook=({fromDate,toDate,session,signal,onSessionRefreshed})=>
  get(`/reports/daily/cashbook?${query({fromDate,toDate})}`,session,signal,onSessionRefreshed);
export const getDailyBankBook=({fromDate,toDate,session,signal,onSessionRefreshed})=>
  get(`/reports/daily/bankbook?${query({fromDate,toDate})}`,session,signal,onSessionRefreshed);
