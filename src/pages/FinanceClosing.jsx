import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Tab, Tabs, TextField, Typography } from '@mui/material';
import LockClockIcon from '@mui/icons-material/LockClock';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useDispatch, useSelector } from 'react-redux';
import usePermission from '../security/usePermission';
import { sessionRefreshed } from '../features/auth/authSlice';
import * as api from '../services/closingApi';

const GREEN = '#08783e';
const LIGHT = '#eef8f2';

export default function FinanceClosing() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const partialPermission = usePermission('150400');
  const fullPermission = usePermission('150500');
  const yearPermission = usePermission('150800');
  const options = useMemo(() => ({
    session: { tenantKey: auth.tenantKey, accessToken: auth.accessToken || auth.token, refreshToken: auth.refreshToken },
    onSessionRefreshed: (next) => dispatch(sessionRefreshed(next)),
  }), [auth.tenantKey, auth.accessToken, auth.token, auth.refreshToken, dispatch]);

  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState(0);
  const [monthNo, setMonthNo] = useState(new Date().getMonth() + 1);
  const [newYear, setNewYear] = useState('');
  const [closeType, setCloseType] = useState(0);
  const [plAccount, setPlAccount] = useState('');
  const [goldRate, setGoldRate] = useState('0');
  const [silverRate, setSilverRate] = useState('0');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    try {
      setError('');
      const result = await api.getStatus(options);
      setStatus(result);
      setNewYear((current) => current || String(Number(result.financialYear) + 1));
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { load(); }, []);

  const run = async () => {
    const action = confirm;
    setConfirm(null);
    setBusy(true);
    setError('');
    setMessage('');
    try {
      let result;
      if (action === 'partial') result = await api.partialMonthClose(monthNo, options);
      if (action === 'full') result = await api.fullMonthClose(monthNo, options);
      if (action === 'year') result = await api.yearEnd({
        newFinancialYear: Number(newYear), closeType: Number(closeType), profitLossAccountNo: plAccount,
        goldRate: Number(goldRate || 0), silverRate: Number(silverRate || 0),
      }, options);
      setMessage(result?.message || 'Closing process completed successfully.');
      await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const selectedMonth = status?.months?.find((m) => m.monthNo === Number(monthNo));
  const canPartial = partialPermission.canAdd && !selectedMonth?.exists;
  const canFull = fullPermission.canAdd && !selectedMonth?.fullyClosed;
  const canYear = yearPermission.canAdd && plAccount && Number(newYear) > Number(status?.financialYear || 0);

  return <Box sx={{ p: { xs: 1, md: 2 } }}>
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight={800} color={GREEN}>Monthly / Yearly Closing</Typography>
        <Box sx={{ flex: 1 }} />
        <Chip label={`Financial Year ${status?.financialYear || '-'}`} />
        <Chip label={status?.yearStatus || 'OPEN'} color={status?.yearStatus === 'CLOSED' ? 'default' : 'success'} />
      </Box>
      <Divider sx={{ my: 2 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label="Month Closing" icon={<CalendarMonthIcon />} iconPosition="start" />
        <Tab label="Year End" icon={<EventBusyIcon />} iconPosition="start" />
      </Tabs>

      {tab === 0 && <Box>
        <Typography variant="h6" fontWeight={800} color={GREEN}>Month Closing</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Partial closing posts/locks the selected month's transactions. Full closing requires all vouchers in the month to be posted.</Typography>
        <FormControl sx={{ minWidth: 260, mb: 3 }}>
          <InputLabel>Month</InputLabel>
          <Select value={monthNo} label="Month" onChange={(e) => setMonthNo(Number(e.target.value))}>
            {(status?.months || []).map((month) => <MenuItem key={month.monthNo} value={month.monthNo}>{month.monthName} {month.fullyClosed ? '— Closed' : month.exists ? '— Partially Closed' : ''}</MenuItem>)}
          </Select>
        </FormControl>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: LIGHT }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 260 }}><Typography fontWeight={800}>Selected month: {selectedMonth?.monthName || '-'}</Typography><Typography variant="body2" color="text.secondary">Status: {selectedMonth?.fullyClosed ? 'Fully Closed' : selectedMonth?.exists ? 'Partially Closed' : 'Open'}</Typography></Box>
            {partialPermission.canView && <Button variant="outlined" startIcon={<LockClockIcon />} disabled={busy || !canPartial} onClick={() => setConfirm('partial')}>Partial Month Close</Button>}
            {fullPermission.canView && <Button variant="contained" startIcon={<EventBusyIcon />} disabled={busy || !canFull} onClick={() => setConfirm('full')} sx={{ bgcolor: GREEN }}>Full Month Close</Button>}
          </Box>
        </Paper>
      </Box>}

      {tab === 1 && <Box>
        <Typography variant="h6" fontWeight={800} color={GREEN}>Year End Process</Typography>
        <Alert severity="warning" sx={{ my: 2 }}>Year End is a major accounting operation. It creates END ledger entries, closes the current year/months and activates the new financial year.</Alert>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, maxWidth: 900 }}>
          <TextField label="Current Financial Year" value={status?.financialYear || ''} disabled />
          <TextField label="New Financial Year" type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} />
          <FormControl><InputLabel>Close Type</InputLabel><Select value={closeType} label="Close Type" onChange={(e) => setCloseType(Number(e.target.value))}><MenuItem value={0}>By Company</MenuItem><MenuItem value={1}>By Location</MenuItem></Select></FormControl>
          <FormControl><InputLabel>Profit & Loss A/c</InputLabel><Select value={plAccount} label="Profit & Loss A/c" onChange={(e) => setPlAccount(e.target.value)}>{(status?.profitLossAccounts || []).map((a) => <MenuItem key={a.accountNo} value={a.accountNo}>{a.accountName} ({a.accountNo})</MenuItem>)}</Select></FormControl>
          <TextField label="Gold Rate" type="number" value={goldRate} onChange={(e) => setGoldRate(e.target.value)} inputProps={{ step: '0.001' }} />
          <TextField label="Silver Rate" type="number" value={silverRate} onChange={(e) => setSilverRate(e.target.value)} inputProps={{ step: '0.001' }} />
        </Box>
        {yearPermission.canView && <Button variant="contained" size="large" disabled={busy || !canYear} onClick={() => setConfirm('year')} sx={{ mt: 3, bgcolor: GREEN }}>Process Year End</Button>}
      </Box>}
    </Paper>

    <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Closing Process</DialogTitle>
      <DialogContent><Typography>{confirm === 'year' ? `Process Year End for ${status?.financialYear} and activate ${newYear}? This operation affects accounting balances and financial-year status.` : `${confirm === 'partial' ? 'Partially' : 'Fully'} close ${selectedMonth?.monthName} ${status?.financialYear}?`}</Typography></DialogContent>
      <DialogActions><Button onClick={() => setConfirm(null)}>Cancel</Button><Button variant="contained" onClick={run} sx={{ bgcolor: GREEN }}>Confirm</Button></DialogActions>
    </Dialog>
  </Box>;
}
