import { refresh as refreshSession } from "./matrixAuthApi";
const base=(import.meta.env.VITE_MATRIX_API_BASE_URL||"/api").replace(/\/$/,"");let rp=null;
const msg=async r=>{try{const b=await r.json();return b?.message||b?.detail||b?.title||`Request failed (${r.status})`;}catch{return `Request failed (${r.status})`;}};
async function send(path,{method="GET",body,session,onSessionRefreshed}={}){const call=t=>fetch(`${base}${path}`,{method,headers:{Accept:"application/json",...(body!==undefined?{"Content-Type":"application/json"}:{}),"X-Tenant-Key":session.tenantKey,Authorization:`Bearer ${t}`},...(body!==undefined?{body:JSON.stringify(body)}:{})});let r=await call(session.accessToken);if(r.status===401&&session.refreshToken){if(!rp)rp=refreshSession({tenantKey:session.tenantKey,refreshToken:session.refreshToken}).finally(()=>rp=null);const n=await rp;if(!n?.succeeded)throw new Error(n?.error||"Session expired.");onSessionRefreshed?.(n);r=await call(n.accessToken);}if(!r.ok)throw new Error(await msg(r));return r.status===204?null:r.json();}
export const getDcnLookups=o=>send('/debit-credit-notes/lookups',o);
export const getDcnRate=(c,d,o)=>send(`/debit-credit-notes/currency-rate?currencyId=${encodeURIComponent(c)}&date=${d}`,o);
export const getDcnList=(t,f,to,o)=>send(`/debit-credit-notes/${t}?fromDate=${f||''}&toDate=${to||''}`,o);
export const getDcn=(t,n,o)=>send(`/debit-credit-notes/${t}/${n}`,o);
export const createDcn=(t,b,o)=>send(`/debit-credit-notes/${t}`,{...o,method:'POST',body:b});
export const updateDcn=(t,n,b,o)=>send(`/debit-credit-notes/${t}/${n}`,{...o,method:'PUT',body:b});
export const deleteDcn=(t,n,o)=>send(`/debit-credit-notes/${t}/${n}`,{...o,method:'DELETE'});
export const postDcn=(t,n,o)=>send(`/debit-credit-notes/${t}/${n}/post`,{...o,method:'POST'});
