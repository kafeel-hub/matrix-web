import { refresh as refreshSession } from "./matrixAuthApi";
const base=(import.meta.env.VITE_MATRIX_API_BASE_URL||"/api").replace(/\/$/,""); let rp=null;
const message=async r=>{try{const b=await r.json();return b?.message||b?.detail||b?.title||`Request failed (${r.status})`;}catch{return `Request failed (${r.status})`;}};
async function send(path,{method="GET",body,session,onSessionRefreshed}={}){const call=t=>fetch(`${base}${path}`,{method,headers:{Accept:"application/json",...(body!==undefined?{"Content-Type":"application/json"}:{}),"X-Tenant-Key":session.tenantKey,Authorization:`Bearer ${t}`},...(body!==undefined?{body:JSON.stringify(body)}:{})});let r=await call(session.accessToken);if(r.status===401&&session.refreshToken){if(!rp)rp=refreshSession({tenantKey:session.tenantKey,refreshToken:session.refreshToken}).finally(()=>rp=null);const n=await rp;if(!n?.succeeded)throw new Error(n?.error||"Session expired.");onSessionRefreshed?.(n);r=await call(n.accessToken);}if(!r.ok)throw new Error(await message(r));return r.status===204?null:r.json();}
export const getAccountChart=(o)=>send("/accounts/chart",o);
export const getAccountMaster=(no,o)=>send(`/accounts/master/${encodeURIComponent(no)}`,o);
export const createAccount=(body,o)=>send("/accounts/master",{...o,method:"POST",body});
export const updateAccount=(no,body,o)=>send(`/accounts/master/${encodeURIComponent(no)}`,{...o,method:"PUT",body});
export const getCurrencies=async(o)=>(await send("/accounts/master-lookups",o)).currencies||[];
export const getAccountBalance=(no,o)=>send(`/accounts/${encodeURIComponent(no)}/balance`,o);
export const getAccountLedger=(no,fromDate,toDate,o)=>send(`/accounts/master/${encodeURIComponent(no)}/ledger?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`,o);
