import { refresh as refreshSession } from "./matrixAuthApi";
const base=(import.meta.env.VITE_MATRIX_API_BASE_URL||"/api").replace(/\/$/,"");let rp=null;
const msg=async r=>{try{const b=await r.json();return b?.message||b?.detail||b?.title||`Request failed (${r.status})`;}catch{return `Request failed (${r.status})`;}};
async function send(path,{method="GET",body,session,onSessionRefreshed}={}){const call=t=>fetch(`${base}${path}`,{method,headers:{Accept:"application/json",...(body!==undefined?{"Content-Type":"application/json"}:{}),"X-Tenant-Key":session.tenantKey,Authorization:`Bearer ${t}`},...(body!==undefined?{body:JSON.stringify(body)}:{})});let r=await call(session.accessToken);if(r.status===401&&session.refreshToken){if(!rp)rp=refreshSession({tenantKey:session.tenantKey,refreshToken:session.refreshToken}).finally(()=>rp=null);const n=await rp;if(!n?.succeeded)throw new Error(n?.error||"Session expired.");onSessionRefreshed?.(n);r=await call(n.accessToken);}if(!r.ok)throw new Error(await msg(r));return r.status===204?null:r.json();}
export const getLookups=o=>send('/account-settlements/lookups',o);
export const getOpenItems=(a,d,n,o)=>send(`/account-settlements/open-items?accountNo=${encodeURIComponent(a)}&asOfDate=${encodeURIComponent(d)}${n?`&settlementNo=${n}`:''}`,o);
export const getList=(f,t,o)=>send(`/account-settlements?fromDate=${f||''}&toDate=${t||''}`,o);
export const getOne=(n,o)=>send(`/account-settlements/${n}`,o);
export const create=(b,o)=>send('/account-settlements',{...o,method:'POST',body:b});
export const update=(n,b,o)=>send(`/account-settlements/${n}`,{...o,method:'PUT',body:b});
export const remove=(n,o)=>send(`/account-settlements/${n}`,{...o,method:'DELETE'});
