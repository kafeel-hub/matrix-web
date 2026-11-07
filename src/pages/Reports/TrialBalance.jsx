import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { sessionRefreshed } from '../../features/auth/authSlice';
import * as api from '../../services/financialStatementsApi';

const GREEN = '#08783e';
const LIGHT = '#eef8f2';
const RED = '#c62828';
const n = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default function TrialBalance() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const fy = auth.context?.financialYear;
  const initialFrom = fy?.startDate ? dayjs(fy.startDate) : dayjs().startOf('year');
  const initialTo = fy?.endDate && dayjs(fy.endDate).isBefore(dayjs()) ? dayjs(fy.endDate) : dayjs();
  const [fromDate, setFromDate] = useState(initialFrom.format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(initialTo.format('YYYY-MM-DD'));
  const [trialType, setTrialType] = useState(2);
  const [trialFor, setTrialFor] = useState(0);
  const [accountLevel, setAccountLevel] = useState(0);
  const [accountGroup, setAccountGroup] = useState('');
  const [accountGroups, setAccountGroups] = useState([]);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [goldRate, setGoldRate] = useState('0');
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const options = useMemo(
    () => ({
      session: {
        tenantKey: auth.tenantKey,
        accessToken: auth.accessToken || auth.token,
        refreshToken: auth.refreshToken,
      },
      onSessionRefreshed: (next) => dispatch(sessionRefreshed(next)),
    }),
    [auth.tenantKey, auth.accessToken, auth.token, auth.refreshToken, dispatch]
  );

  useEffect(() => {
    let active = true;

    const loadLookups = async () => {
      try {
        const lookups = await api.getTrialBalanceLookups(options);
        if (active) setAccountGroups(lookups?.accountGroups || []);
      } catch (e) {
        if (active) setError(e.message);
      }
    };

    loadLookups();
    return () => {
      active = false;
    };
  }, [options]);

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getTrialBalance(
        {
          dateFrom: fromDate,
          dateTo: toDate,
          trialType: Number(trialType),
          accountGroup: accountGroup.trim() || null,
          accountLevel: Number(accountLevel),
          hideZeroBalances,
          trialFor: Number(trialFor),
          goldRate: Number(goldRate || 0),
        },
        options
      );
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const rows = (data?.rows || []).filter((r) => {
    const q = search.trim().toLowerCase();
    return !q || [r.accountNo, r.accountName, r.groupCode, r.groupName].some((v) => String(v ?? '').toLowerCase().includes(q));
  });
  const showAmount = Number(trialFor) !== 2;
  const showGold = Number(trialFor) !== 1;

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <AssessmentIcon sx={{ color: GREEN, fontSize: 34 }} />
          <Box>
            <Typography variant="h4" fontWeight={800} color={GREEN}>Trial Balance</Typography>
            <Typography variant="body2" color="text.secondary">Financial Year {data?.financialYear || fy?.yearNo || '-'}</Typography>
          </Box>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: LIGHT }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <FormControl><InputLabel>Trial Type</InputLabel><Select value={trialType} label="Trial Type" onChange={(e) => setTrialType(Number(e.target.value))}><MenuItem value={0}>Opening Trial</MenuItem><MenuItem value={1}>As On Date</MenuItem><MenuItem value={2}>Periodical</MenuItem><MenuItem value={3}>Periodical Without Opening</MenuItem></Select></FormControl>
            <FormControl><InputLabel>Trial For</InputLabel><Select value={trialFor} label="Trial For" onChange={(e) => setTrialFor(Number(e.target.value))}><MenuItem value={0}>Amount & Gold</MenuItem><MenuItem value={1}>Amount</MenuItem><MenuItem value={2}>Gold</MenuItem></Select></FormControl>
            <FormControl>
              <InputLabel>Account Group</InputLabel>
              <Select value={accountGroup} label="Account Group" onChange={(e) => setAccountGroup(e.target.value)}>
                <MenuItem value="">All Account Groups</MenuItem>
                {accountGroups.map((group) => (
                  <MenuItem key={group.accountNo} value={group.accountNo}>
                    {group.accountNo} - {group.accountName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Account Level</InputLabel>
              <Select value={accountLevel} label="Account Level" onChange={(e) => setAccountLevel(Number(e.target.value))}>
                {[0, 1, 2, 3, 4].map((level) => (
                  <MenuItem key={level} value={level}>
                    {level === 0 ? 'All Levels' : level === 4 ? '4 - Account Detail' : `Level ${level}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Gold Rate" type="number" value={goldRate} onChange={(e) => setGoldRate(e.target.value)} inputProps={{ min: 0, step: '0.001' }} />
            <FormControl><InputLabel>Zero Balances</InputLabel><Select value={hideZeroBalances ? 1 : 0} label="Zero Balances" onChange={(e) => setHideZeroBalances(Number(e.target.value) === 1)}><MenuItem value={0}>Show</MenuItem><MenuItem value={1}>Hide</MenuItem></Select></FormControl>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}><Button variant="contained" onClick={run} disabled={loading} sx={{ bgcolor: GREEN }}>{loading ? 'Generating...' : 'Generate Trial Balance'}</Button></Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {data && <>
          <Box sx={{ my: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label={`${data.rows?.length || 0} Rows`} />
            <Chip label={`${dayjs(data.dateFrom).format('DD/MM/YYYY')} to ${dayjs(data.dateTo).format('DD/MM/YYYY')}`} variant="outlined" />
            <Box sx={{ flex: 1 }} />
            <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search account or group..." InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: { xs: '100%', sm: 300 } }} />
          </Box>
          <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: showAmount && showGold ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' }, gap: 1.5 }}>
            {showAmount && <FinancialStatusCard label="Amount Difference" value={data.totals?.amountDifference} />}
            {showGold && <FinancialStatusCard label="Gold Difference" value={data.totals?.goldDifference} />}
            {showAmount && <SummaryCard label="Closing Debit" value={data.totals?.closingDebit} />}
            {showAmount && <SummaryCard label="Closing Credit" value={data.totals?.closingCredit} />}
            {!showAmount && showGold && <SummaryCard label="Gold Closing Debit" value={data.totals?.goldClosingDebit} />}
            {!showAmount && showGold && <SummaryCard label="Gold Closing Credit" value={data.totals?.goldClosingCredit} />}
          </Box>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 390px)', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table stickyHeader size="small">
              <TableHead><TableRow><TableCell sx={{ bgcolor: GREEN, color: 'white', fontWeight: 800 }}>Account</TableCell><TableCell sx={{ bgcolor: GREEN, color: 'white', fontWeight: 800 }}>Account Name</TableCell>{showAmount && ['Opening Dr','Opening Cr','Debit','Credit','Closing Dr','Closing Cr'].map((h) => <TableCell key={h} align="right" sx={{ bgcolor: GREEN, color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>{h}</TableCell>)}{showGold && ['Gold Open Dr','Gold Open Cr','Gold Dr','Gold Cr','Gold Close Dr','Gold Close Cr'].map((h) => <TableCell key={h} align="right" sx={{ bgcolor: GREEN, color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>{rows.length === 0 && <TableRow><TableCell colSpan={14} align="center" sx={{ py: 5, color: 'text.secondary' }}>No Trial Balance rows found.</TableCell></TableRow>}{rows.map((r, i) => <TableRow key={`${r.accountSerialNo || r.accountNo}|${i}`} hover sx={{ bgcolor: Number(r.accountLevel || 0) < 4 ? LIGHT : undefined }}><TableCell sx={{ fontWeight: Number(r.accountLevel || 0) < 4 ? 800 : 400 }}>{r.accountNo || r.groupCode || '-'}</TableCell><TableCell sx={{ pl: 1 + Math.min(Number(r.accountLevel || 0), 4) * 1.5, fontWeight: Number(r.accountLevel || 0) < 4 ? 800 : 400 }}>{r.accountName || r.groupName || '-'}</TableCell>{showAmount && [r.openingDebit,r.openingCredit,r.debit,r.credit,r.closingDebit,r.closingCredit].map((v,j) => <FinancialCell key={j} value={v} tone={j % 2 === 0 ? 'debit' : 'credit'} />)}{showGold && [r.goldOpeningDebit,r.goldOpeningCredit,r.goldDebit,r.goldCredit,r.goldClosingDebit,r.goldClosingCredit].map((v,j) => <FinancialCell key={j} value={v} tone={j % 2 === 0 ? 'debit' : 'credit'} />)}</TableRow>)}</TableBody>
            </Table>
          </TableContainer>
          <Paper variant="outlined" sx={{ mt: 2, p: 1.5, bgcolor: LIGHT, display: 'flex', gap: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>{showAmount && <><Typography variant="body2"><b>Opening:</b> Dr {n(data.totals?.openingDebit)} / Cr {n(data.totals?.openingCredit)}</Typography><Typography variant="body2"><b>Period:</b> Dr {n(data.totals?.debit)} / Cr {n(data.totals?.credit)}</Typography><Typography fontWeight={800}>Closing: Dr {n(data.totals?.closingDebit)} / Cr {n(data.totals?.closingCredit)}</Typography></>}{showGold && <Typography fontWeight={800}>Gold Closing: Dr {n(data.totals?.goldClosingDebit)} / Cr {n(data.totals?.goldClosingCredit)}</Typography>}</Paper>
        </>}
      </Paper>
    </Box>
  );
}


function SummaryCard({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderLeft: `4px solid ${GREEN}` }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
      <Typography variant="h6" fontWeight={800}>{n(value)}</Typography>
    </Paper>
  );
}

function FinancialStatusCard({ label, value }) {
  const difference = Number(value || 0);
  const balanced = Math.abs(difference) < 0.0005;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderLeft: `4px solid ${balanced ? GREEN : RED}`, bgcolor: balanced ? LIGHT : '#fff5f5' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {balanced ? <CheckCircleIcon sx={{ color: GREEN }} /> : <WarningAmberIcon sx={{ color: RED }} />}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
          <Typography variant="h6" fontWeight={800} color={balanced ? GREEN : RED}>{n(difference)}</Typography>
          <Typography variant="caption" fontWeight={700} color={balanced ? GREEN : RED}>{balanced ? 'Balanced' : 'Difference'}</Typography>
        </Box>
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
