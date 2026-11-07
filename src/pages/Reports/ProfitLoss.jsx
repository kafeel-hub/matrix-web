import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { sessionRefreshed } from '../../features/auth/authSlice';
import * as api from '../../services/financialStatementsApi';

const GREEN = '#08783e';
const LIGHT = '#eef8f2';
const RED = '#c62828';
const n = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default function ProfitLoss() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const fy = auth.context?.financialYear;
  const initialFrom = fy?.startDate ? dayjs(fy.startDate) : dayjs().startOf('year');
  const initialTo = fy?.endDate && dayjs(fy.endDate).isBefore(dayjs()) ? dayjs(fy.endDate) : dayjs();
  const [dateFrom, setDateFrom] = useState(initialFrom.format('YYYY-MM-DD'));
  const [dateTo, setDateTo] = useState(initialTo.format('YYYY-MM-DD'));
  const [reportType, setReportType] = useState(1);
  const [accountLevel, setAccountLevel] = useState(4);
  const [goldRate, setGoldRate] = useState('0');
  const [silverRate, setSilverRate] = useState('0');
  const [unrealizedFlag, setUnrealizedFlag] = useState(0);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const options = useMemo(() => ({ session: { tenantKey: auth.tenantKey, accessToken: auth.accessToken || auth.token, refreshToken: auth.refreshToken }, onSessionRefreshed: (next) => dispatch(sessionRefreshed(next)) }), [auth.tenantKey, auth.accessToken, auth.token, auth.refreshToken, dispatch]);

  const run = async () => {
    setLoading(true); setError('');
    try {
      const result = await api.getProfitLoss({ dateFrom, dateTo, reportType: Number(reportType), accountLevel: Number(accountLevel), goldRate: Number(goldRate || 0), silverRate: Number(silverRate || 0), unrealizedFlag: Number(unrealizedFlag) }, options);
      setData(result);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const rows = (data?.rows || []).filter((r) => { const q = search.trim().toLowerCase(); return !q || [r.mainGroupName,r.groupName,r.subGroupName,r.accountNo,r.accountName].some((v) => String(v ?? '').toLowerCase().includes(q)); });

  return <Box sx={{ p: { xs: 1, md: 2 } }}><Paper sx={{ p: { xs: 2, md: 3 } }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><TrendingUpIcon sx={{ color: GREEN, fontSize: 34 }} /><Box><Typography variant="h4" fontWeight={800} color={GREEN}>Profit & Loss</Typography><Typography variant="body2" color="text.secondary">Financial Year {data?.financialYear || fy?.yearNo || '-'}</Typography></Box></Box>
    <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: LIGHT }}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
      <TextField label={Number(reportType) === 0 ? 'As On Date' : 'From Date'} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
      <TextField label="To Date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} disabled={Number(reportType) === 0} InputLabelProps={{ shrink: true }} />
      <FormControl><InputLabel>Report Type</InputLabel><Select value={reportType} label="Report Type" onChange={(e) => setReportType(Number(e.target.value))}><MenuItem value={0}>As On Date</MenuItem><MenuItem value={1}>Periodical</MenuItem></Select></FormControl>
      <FormControl><InputLabel>Account Level</InputLabel><Select value={accountLevel} label="Account Level" onChange={(e) => setAccountLevel(Number(e.target.value))}>{[0,1,2,3,4].map((x) => <MenuItem key={x} value={x}>{x === 4 ? '4 - Account Detail' : `Level ${x}`}</MenuItem>)}</Select></FormControl>
      <TextField label="Gold Rate" type="number" value={goldRate} onChange={(e) => setGoldRate(e.target.value)} inputProps={{ min: 0, step: '0.001' }} />
      <TextField label="Silver Rate" type="number" value={silverRate} onChange={(e) => setSilverRate(e.target.value)} inputProps={{ min: 0, step: '0.001' }} />
      <FormControl><InputLabel>Unrealized Profit</InputLabel><Select value={unrealizedFlag} label="Unrealized Profit" onChange={(e) => setUnrealizedFlag(Number(e.target.value))}><MenuItem value={0}>Exclude</MenuItem><MenuItem value={1}>Include</MenuItem></Select></FormControl>
    </Box><Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}><Button variant="contained" onClick={run} disabled={loading} sx={{ bgcolor: GREEN }}>{loading ? 'Generating...' : 'Generate Profit & Loss'}</Button></Box></Paper>
    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    {data && <><Box sx={{ my: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}><Chip label={`Method ${data.method}`} /><Chip label={`${data.rows?.length || 0} Rows`} /><Box sx={{ flex: 1 }} /><TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search account or group..." InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: { xs: '100%', sm: 300 } }} /></Box>
      <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
        <ProfitCard label="Revenue" value={data.revenue} tone="positive" />
        <ProfitCard label="Expense" value={data.expense} tone="negative" />
        <ProfitCard label={Number(data.netProfit || 0) >= 0 ? 'Net Profit' : 'Net Loss'} value={data.netProfit} tone={Number(data.netProfit || 0) >= 0 ? 'positive' : 'negative'} emphasized />
      </Box>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 390px)', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}><Table stickyHeader size="small"><TableHead><TableRow>{['Account / Group','Description','Debit','Credit','Closing Dr','Closing Cr','Gold','Silver','Balance','Sub Amount','Sub Gold','Sub Gold Amount'].map((h) => <TableCell key={h} align={h === 'Account / Group' || h === 'Description' ? 'left' : 'right'} sx={{ bgcolor: GREEN, color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{rows.length === 0 && <TableRow><TableCell colSpan={12} align="center" sx={{ py: 5, color: 'text.secondary' }}>No Profit & Loss rows found.</TableCell></TableRow>}{rows.map((r, i) => { const level = Number(r.accountLevel ?? 4); const heading = level < 4 || !r.accountNo; return <TableRow key={`${r.printOrder}|${r.accountNo}|${i}`} hover sx={{ bgcolor: heading ? LIGHT : undefined }}><TableCell sx={{ fontWeight: heading ? 800 : 400 }}>{r.accountNo || r.subGroupCode || r.groupCode || r.mainGroupCode || '-'}</TableCell><TableCell sx={{ pl: 1 + Math.min(level, 4) * 1.5, fontWeight: heading ? 800 : 400 }}>{r.accountName || r.subGroupName || r.groupName || r.mainGroupName || '-'}</TableCell>{[r.debit,r.credit,r.closingDebit,r.closingCredit].map((v,j) => <FinancialCell key={j} value={v} tone={j % 2 === 0 ? 'debit' : 'credit'} />)}{[r.goldBalance,r.silverBalance,r.balanceAmount,r.subAmount,r.subGold,r.subGoldAmount].map((v,j) => <TableCell key={`other-${j}`} align="right">{n(v)}</TableCell>)}</TableRow>; })}</TableBody></Table></TableContainer>
      <Paper variant="outlined" sx={{ mt: 2, p: 1.5, bgcolor: LIGHT, display: 'flex', gap: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}><Typography variant="body2"><b>Revenue:</b> {n(data.revenue)}</Typography><Typography variant="body2"><b>Expense:</b> {n(data.expense)}</Typography><Typography fontWeight={800} color={Number(data.netProfit || 0) >= 0 ? GREEN : RED}>{Number(data.netProfit || 0) >= 0 ? 'Net Profit' : 'Net Loss'}: {n(data.netProfit)}</Typography></Paper>
    </>}
  </Paper></Box>;
}


function ProfitCard({ label, value, tone, emphasized = false }) {
  const positive = tone === 'positive';
  const indicatorColor = positive ? GREEN : RED;
  const Icon = positive ? ArrowUpwardIcon : ArrowDownwardIcon;
  return (
    <Paper variant="outlined" sx={{ p: 1.75, borderLeft: `4px solid ${indicatorColor}`, bgcolor: positive ? LIGHT : '#fff5f5' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
          <Typography variant={emphasized ? 'h5' : 'h6'} fontWeight={800} color={indicatorColor}>{n(value)}</Typography>
        </Box>
        <Icon sx={{ color: indicatorColor, fontSize: emphasized ? 32 : 26 }} />
      </Box>
    </Paper>
  );
}

function FinancialCell({ value, tone }) {
  const amount = Number(value || 0);
  const active = Math.abs(amount) > 0.0000001;
  const debit = tone === 'debit';
  return (
    <TableCell
      align="right"
      sx={{
        color: active ? (debit ? RED : GREEN) : 'text.secondary',
        bgcolor: active ? (debit ? '#fff7f7' : '#f4fbf7') : undefined,
        fontWeight: active ? 700 : 400,
        whiteSpace: 'nowrap',
      }}
    >
      {n(value)}
    </TableCell>
  );
}
