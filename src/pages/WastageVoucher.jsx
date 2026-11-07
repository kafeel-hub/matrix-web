import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, Edit, ListAlt, Save } from "@mui/icons-material";
import usePermission from "../security/usePermission";
import { sessionRefreshed } from "../features/auth/authSlice";
import * as api from "../services/wastageVoucherApi";

const GREEN = "#177245";
const LIGHT = "#e8f5ed";
const SCREEN_NO = "060203";

const today = () => new Date().toISOString().slice(0, 10);
const number3 = (value) => Number(value || 0).toFixed(3);

export default function WastageVoucher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const permission = usePermission(SCREEN_NO);

  const requestOptions = {
    session: {
      tenantKey: auth.tenantKey,
      accessToken: auth.accessToken || auth.token,
      refreshToken: auth.refreshToken,
    },
    onSessionRefreshed: (nextSession) => dispatch(sessionRefreshed(nextSession)),
  };

  const [voucherNo, setVoucherNo] = useState(id || "");
  const [manualNo, setManualNo] = useState("");
  const [voucherDate, setVoucherDate] = useState(today());
  const [wastageWeight, setWastageWeight] = useState("");
  const [goldRate, setGoldRate] = useState("");
  const [remark, setRemark] = useState("");
  const [posted, setPosted] = useState(false);
  const [editing, setEditing] = useState(!id);
  const [dirty, setDirty] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const wastageAmount = useMemo(
    () => Number(wastageWeight || 0) * Number(goldRate || 0),
    [wastageWeight, goldRate],
  );

  const canEditFields = !posted && editing && (voucherNo ? permission.canEdit : permission.canAdd);
  const canSave =
    canEditFields &&
    dirty &&
    Number(wastageWeight || 0) > 0 &&
    Number(goldRate || 0) >= 0;

  useEffect(() => {
    if (id) {
      loadVoucher(id);
    } else {
      resetNewVoucher();
    }
  }, [id]);

  async function loadVoucher(number) {
    try {
      setError("");
      const voucher = await api.getOne(number, requestOptions);
      setVoucherNo(voucher.voucherNo);
      setManualNo(voucher.manualNo || "");
      setVoucherDate(voucher.voucherDate?.slice(0, 10) || today());
      setWastageWeight(number3(voucher.wastageWeight));
      setGoldRate(number3(voucher.goldRate));
      setRemark(voucher.remark || "");
      setPosted(Boolean(voucher.posted));
      setEditing(false);
      setDirty(false);
    } catch (exception) {
      setError(exception.message);
    }
  }

  function resetNewVoucher() {
    setVoucherNo("");
    setManualNo("");
    setVoucherDate(today());
    setWastageWeight("");
    setGoldRate("");
    setRemark("");
    setPosted(false);
    setEditing(true);
    setDirty(false);
    setError("");
  }

  function change(setter) {
    return (event) => {
      setter(event.target.value);
      setDirty(true);
      setMessage("");
    };
  }

  async function saveVoucher() {
    try {
      setError("");
      setMessage("");

      const body = {
        voucherNo: voucherNo ? Number(voucherNo) : null,
        manualNo,
        voucherDate,
        wastageWeight: Number(wastageWeight || 0),
        goldRate: Number(goldRate || 0),
        remark,
      };

      const result = voucherNo
        ? await api.update(voucherNo, body, requestOptions)
        : await api.create(body, requestOptions);

      setMessage(result.message);

      if (!voucherNo) {
        navigate(`/wastage-voucher/${result.voucherNo}`, { replace: true });
      }

      await loadVoucher(result.voucherNo);
    } catch (exception) {
      setError(exception.message);
    }
  }

  async function openList() {
    try {
      setError("");
      setList(await api.getList("", "", requestOptions));
      setListOpen(true);
    } catch (exception) {
      setError(exception.message);
    }
  }

  async function deleteVoucher() {
    if (!voucherNo) {
      return;
    }

    try {
      setError("");
      await api.remove(voucherNo, requestOptions);
      navigate("/wastage-voucher", { replace: true });
      resetNewVoucher();
      setMessage("Wastage voucher deleted successfully.");
    } catch (exception) {
      setError(exception.message);
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="h5" fontWeight={800} color={GREEN}>
            Wastage Voucher
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Button startIcon={<ListAlt />} onClick={openList}>
            WST List
          </Button>

          {voucherNo && !editing && !posted && permission.canEdit && (
            <Button
              startIcon={<Edit />}
              onClick={() => {
                setEditing(true);
                setMessage("");
              }}
            >
              Edit
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<Save />}
            disabled={!canSave}
            onClick={saveVoucher}
            sx={{ bgcolor: GREEN }}
          >
            Save
          </Button>

          {voucherNo && (
            <Button
              color="error"
              startIcon={<Delete />}
              disabled={posted || editing || !permission.canDelete}
              onClick={deleteVoucher}
            >
              Delete
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        {message && (
          <Typography color={GREEN} fontWeight={700} sx={{ mb: 1 }}>
            {message}
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: 1.5,
          }}
        >
          <TextField label="Voucher No" value={voucherNo || "New"} disabled />
          <TextField
            label="Reference No"
            value={manualNo}
            onChange={change(setManualNo)}
            disabled={!canEditFields}
          />
          <TextField
            label="Date"
            type="date"
            value={voucherDate}
            onChange={change(setVoucherDate)}
            InputLabelProps={{ shrink: true }}
            disabled={!canEditFields}
          />
          <TextField
            label="Location"
            value={auth.locationName || auth.context?.locationName || "Current Location"}
            disabled
          />
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa", my: 2 }}>
          <Typography fontWeight={800} color={GREEN} sx={{ mb: 1.5 }}>
            Manufacturing Wastage
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            <TextField
              label="Wastage Weight"
              type="number"
              value={wastageWeight}
              onChange={change(setWastageWeight)}
              disabled={!canEditFields}
              inputProps={{ step: "0.001", min: "0" }}
            />
            <TextField
              label="Gold Rate"
              type="number"
              value={goldRate}
              onChange={change(setGoldRate)}
              disabled={!canEditFields}
              inputProps={{ step: "0.001", min: "0" }}
            />
            <TextField
              label="Wastage Amount"
              value={number3(wastageAmount)}
              disabled
              InputProps={{ sx: { fontWeight: 800, color: GREEN } }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Remarks"
            value={remark}
            onChange={change(setRemark)}
            disabled={!canEditFields}
            sx={{ mt: 1.5 }}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: LIGHT }}>
          <Typography fontWeight={800} color={GREEN}>
            Wastage: {number3(wastageWeight)} g &nbsp; | &nbsp; Gold Rate: {number3(goldRate)}
            &nbsp; | &nbsp; Amount: {number3(wastageAmount)}
          </Typography>
        </Paper>

        <Dialog open={listOpen} onClose={() => setListOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Wastage Voucher List</DialogTitle>
          <DialogContent>
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="right">Wastage Weight</TableCell>
                    <TableCell align="right">Gold Rate</TableCell>
                    <TableCell align="right">Wastage Amount</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((row) => (
                    <TableRow
                      hover
                      key={row.voucherNo}
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setListOpen(false);
                        navigate(`/wastage-voucher/${row.voucherNo}`);
                      }}
                    >
                      <TableCell>{row.voucherNo}</TableCell>
                      <TableCell>{row.voucherDate?.slice(0, 10)}</TableCell>
                      <TableCell>{row.manualNo}</TableCell>
                      <TableCell align="right">{number3(row.wastageWeight)}</TableCell>
                      <TableCell align="right">{number3(row.goldRate)}</TableCell>
                      <TableCell align="right">{number3(row.wastageAmount)}</TableCell>
                      <TableCell>{row.remark}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setListOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
