import { refresh as refreshSession } from "./matrixAuthApi";

const configuredBase = import.meta.env.VITE_MATRIX_API_BASE_URL || "/api";
const baseUrl = configuredBase.replace(/\/$/, "");
let refreshPromise = null;
const readError = async (response) => { try { const body=await response.json(); const validation=Array.isArray(body?.errors)?body.errors.map(x=>x.message||x.code).filter(Boolean).join("\n"):""; return validation||body?.detail||body?.message||body?.title||`Request failed (${response.status})`; } catch { return `Request failed (${response.status})`; } };
const rotate = async (session,onSessionRefreshed) => { if(!refreshPromise){refreshPromise=refreshSession({tenantKey:session.tenantKey,refreshToken:session.refreshToken}).finally(()=>{refreshPromise=null;});} const refreshed=await refreshPromise; if(!refreshed?.succeeded) throw new Error(refreshed?.error||"Your session has expired."); onSessionRefreshed?.(refreshed); return refreshed; };
const send = async (path,{method="GET",body,session,signal,onSessionRefreshed}={}) => { const invoke=(token)=>fetch(`${baseUrl}${path}`,{method,headers:{Accept:"application/json",...(body!==undefined?{"Content-Type":"application/json"}:{}),"X-Tenant-Key":session.tenantKey,Authorization:`Bearer ${token}`},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal}); let response=await invoke(session.accessToken); if(response.status===401&&session.refreshToken){const refreshed=await rotate(session,onSessionRefreshed);response=await invoke(refreshed.accessToken);} if(!response.ok) throw new Error(await readError(response)); return response.status===204?null:response.json(); };
export const savePurchaseGoldFixingVoucher=({request,...options})=>send("/purchase-gold-fixing-vouchers",{...options,method:"POST",body:request});
export const getPurchaseGoldFixingLookups=(options)=>send("/purchase-gold-fixing-vouchers/lookups",options);
export const searchPurchaseGoldFixingAccounts=({search="",page=1,pageSize=50,...options})=>send(`/accounts/search?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,options);
export const searchPurchaseGoldFixingSuppliers=({search="",take=100,...options})=>send(`/purchase-gold-fixing-vouchers/suppliers?search=${encodeURIComponent(search)}&take=${take}`,options);
export const getPurchaseGoldFixingSupplier=({supplierId,...options})=>send(`/purchase-gold-fixing-vouchers/suppliers/${encodeURIComponent(supplierId)}`,options);
export const listPurchaseGoldFixingVouchers=({date,...options})=>send(`/purchase-gold-fixing-vouchers?date=${encodeURIComponent(date)}`,options);
export const getPurchaseGoldFixingVoucher=({voucherNo,...options})=>send(`/purchase-gold-fixing-vouchers/${encodeURIComponent(voucherNo)}`,options);
