import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { BarChart, Refresh, WorkspacePremium } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { sessionRefreshed } from "../features/auth/authSlice";
import DashboardTabs from "../components/Dashboard/DashboardTabs";
import OverviewTab from "../components/Dashboard/OverviewTab";
import GoldScrapTab from "../components/Dashboard/GoldScrapTab";
import CashFlowTab from "../components/Dashboard/CashFlowTab";
import BalancesTab from "../components/Dashboard/BalanceTab";
import { getDashboard, getDashboardAnalytics } from "../services/dashboardApi";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const defaultRange = () => {
  const today = iso(new Date());
  return { dateFrom: today, dateTo: today };
};
const TAB_KEYS = ["overview", "gold-scrap", "cash-flow", "balances"];
const daysBetween = (a,b) => Math.ceil((new Date(b)-new Date(a))/86400000)+1;

export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const [range, setRange] = useState(defaultRange);
  const [draft, setDraft] = useState(range);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [tabData, setTabData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const auth = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const session = { accessToken: auth.accessToken || auth.token, refreshToken: auth.refreshToken, tenantKey: auth.tenantKey };
  const groupBy = useMemo(() => daysBetween(range.dateFrom, range.dateTo) > 90 ? "month" : "day", [range]);

  const load = useCallback(async (tabIndex, signal, force = false) => {
    const tabKey = TAB_KEYS[tabIndex];
    const cacheKey = `${tabKey}|${range.dateFrom}|${range.dateTo}|${groupBy}`;
    if (!force && tabData[cacheKey]) return;

    setLoading(true); setError("");
    try {
      const args = { ...range, tab: tabKey, session, signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) };
      // Overview consumes analytics only. The other tabs use a small tab-filtered slice
      // from both existing endpoint families. SQL for unrelated tabs is gated server-side.
      const [main, detail] = tabKey === "overview"
        ? [null, await getDashboardAnalytics({ ...args, groupBy })]
        : await Promise.all([getDashboard(args), getDashboardAnalytics({ ...args, groupBy })]);
      setTabData(prev => ({ ...prev, [cacheKey]: { dashboard: main || {}, analytics: detail || {} } }));
    } catch (e) {
      if (e?.name !== "AbortError") setError(e?.message || "Unable to load dashboard data.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [range, auth.accessToken, auth.refreshToken, auth.tenantKey, groupBy, dispatch, tabData]);

  const activeKey = `${TAB_KEYS[tab]}|${range.dateFrom}|${range.dateTo}|${groupBy}`;
  const activeData = tabData[activeKey];
  const dashboard = activeData?.dashboard || {};
  const analytics = activeData?.analytics || {};

  useEffect(() => {
    if (activeData) return undefined;
    const c = new AbortController();
    load(tab, c.signal);
    return () => c.abort();
  }, [tab, activeKey, activeData, load]);

  const applyRange = () => {
    if (!draft.dateFrom || !draft.dateTo || draft.dateFrom > draft.dateTo) { setError("Please select a valid From and To date."); return; }
    if (daysBetween(draft.dateFrom, draft.dateTo) > 1827) { setError("The analytics date range cannot exceed 5 years."); return; }
    setTabData({}); setRange(draft); setPeriodOpen(false);
  };

  return <Box sx={{minHeight:"100vh",background:"linear-gradient(180deg,#050612 0%,#090b1c 100%)",color:"#fff",overflowX:"hidden"}}>
    <Box sx={{background:"linear-gradient(90deg,#11122d 0%,#070816 100%)",borderBottom:"1px solid #d4af37",px:3,py:2}}>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1.5}><WorkspacePremium sx={{color:"#f5b041",fontSize:32}}/><Typography sx={{fontSize:{xs:"1.25rem",md:"2rem"},fontWeight:800,color:"#e1bb3f",lineHeight:1.15,letterSpacing:.5}}>Executive Summary Dashboard · {range.dateFrom} to {range.dateTo} · {groupBy}</Typography></Box>
        <Box display="flex" gap={1}><Button onClick={()=>load(tab, undefined, true)} startIcon={<Refresh/>} sx={{color:"#d4af37",border:"1px solid #5b4b1d",borderRadius:"20px",textTransform:"none"}}>Refresh</Button><Button onClick={()=>{setDraft(range);setPeriodOpen(true)}} startIcon={<BarChart/>} sx={{background:"#d4af37",color:"#000",borderRadius:"20px",px:2.5,fontWeight:700,textTransform:"none","&:hover":{background:"#caa52e"}}}>Period Report</Button></Box>
      </Box>
    </Box>

    <DashboardTabs value={tab} onChange={setTab}/>
    <Box p={2.5}>
      {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
      {loading && <Box sx={{height:320,display:"grid",placeItems:"center"}}><Box textAlign="center"><CircularProgress sx={{color:"#d4af37"}}/><Typography sx={{color:"#9ea3d1",mt:2}}>Loading {TAB_KEYS[tab].replaceAll("-", " ")}...</Typography></Box></Box>}
      {!loading && activeData && <>{tab===0&&<OverviewTab dashboard={dashboard} analytics={analytics} groupBy={groupBy}/>} {tab===1&&<GoldScrapTab dashboard={dashboard} analytics={analytics} groupBy={groupBy}/>} {tab===2&&<CashFlowTab dashboard={dashboard} analytics={analytics} groupBy={groupBy}/>} {tab===3&&<BalancesTab dashboard={dashboard} analytics={analytics} groupBy={groupBy}/>}</>}
    </Box>

    <Dialog open={periodOpen} onClose={()=>setPeriodOpen(false)} PaperProps={{sx:{background:"#171936",color:"#fff",border:"1px solid #2b2e52",minWidth:{sm:560}}}}>
      <DialogTitle sx={{fontSize:{xs:"1.6rem",sm:"2rem"},fontWeight:700}}>Period Report</DialogTitle>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DialogContent sx={{display:"flex",flexDirection:{xs:"column",sm:"row"},gap:2,pt:"12px !important"}}>
          <DatePicker
            label="From"
            format="DD/MM/YYYY"
            value={draft.dateFrom ? dayjs(draft.dateFrom) : null}
            onChange={(value)=>setDraft(x=>({...x,dateFrom:value?.isValid()?value.format("YYYY-MM-DD"):""}))}
            maxDate={draft.dateTo ? dayjs(draft.dateTo) : dayjs()}
            slotProps={{
              textField:{fullWidth:true},
              popper:{sx:{"& .MuiPaper-root":{backgroundColor:"#171936",color:"#fff",border:"1px solid #2b2e52"},"& .MuiPickersDay-root":{color:"#fff"},"& .MuiPickersDay-root.Mui-selected":{backgroundColor:"#d4af37",color:"#090b1c"},"& .MuiDayCalendar-weekDayLabel":{color:"#9ea3d1"},"& .MuiPickersCalendarHeader-label":{color:"#fff"},"& .MuiSvgIcon-root":{color:"#d4af37"}}}
            }}
            sx={{"& .MuiInputBase-root":{color:"#fff"},"& .MuiInputLabel-root":{color:"#9ea3d1"},"& .MuiOutlinedInput-notchedOutline":{borderColor:"#2b2e52"},"& .MuiSvgIcon-root":{color:"#d4af37"}}}
          />
          <DatePicker
            label="To"
            format="DD/MM/YYYY"
            value={draft.dateTo ? dayjs(draft.dateTo) : null}
            onChange={(value)=>setDraft(x=>({...x,dateTo:value?.isValid()?value.format("YYYY-MM-DD"):""}))}
            minDate={draft.dateFrom ? dayjs(draft.dateFrom) : undefined}
            maxDate={dayjs()}
            slotProps={{
              textField:{fullWidth:true},
              popper:{sx:{"& .MuiPaper-root":{backgroundColor:"#171936",color:"#fff",border:"1px solid #2b2e52"},"& .MuiPickersDay-root":{color:"#fff"},"& .MuiPickersDay-root.Mui-selected":{backgroundColor:"#d4af37",color:"#090b1c"},"& .MuiDayCalendar-weekDayLabel":{color:"#9ea3d1"},"& .MuiPickersCalendarHeader-label":{color:"#fff"},"& .MuiSvgIcon-root":{color:"#d4af37"}}}
            }}
            sx={{"& .MuiInputBase-root":{color:"#fff"},"& .MuiInputLabel-root":{color:"#9ea3d1"},"& .MuiOutlinedInput-notchedOutline":{borderColor:"#2b2e52"},"& .MuiSvgIcon-root":{color:"#d4af37"}}}
          />
        </DialogContent>
      </LocalizationProvider>
      <DialogActions sx={{px:3,pb:2}}><Button onClick={()=>setPeriodOpen(false)} sx={{color:"#9ea3d1"}}>Cancel</Button><Button onClick={applyRange} sx={{color:"#d4af37",fontWeight:700}}>Apply</Button></DialogActions>
    </Dialog>
  </Box>;
}
