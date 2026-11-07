import React, { useEffect, useMemo, useState } from "react";
import { Paper, Box, Divider } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import MainHeading from "../components/Common/MainHeading";
import CustomerDetailVoucherForm from "../components/GoldComponents/CustomerDetailVoucherForm";
import PaymentBreakdownPCE from "../components/Common/PaymentBreakdownPCE";
import FooterButtonsGroup from "../components/Customcomponents/FooterButtonsGroup";
import Loader from "../components/Loader/Loader";
import Popup from "../components/Customcomponents/Popup";
import InvoicePopup from "../components/Customcomponents/InvoicePopup";
import { sessionRefreshed } from "../features/auth/authSlice";
import * as pcvApi from "../services/pettyCashExpenseApi";
import { getAccountBalance } from "../services/accountBalanceApi";

const legacyOptions = (items = []) => items.map((x) => ({
  fldID: x.accountNo,
  fldDisplay: `${x.accountNo} ${x.accountName}`.trim(),
  value: x.accountNo,
  label: `${x.accountNo} ${x.accountName}`.trim(),
}));

export default function PrettyCashExpenses() {
  const theme = useTheme();
  const { id: routeVoucherNo } = useParams();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth || {});
  const session = useMemo(() => ({
    tenantKey: auth.tenantKey,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
  }), [auth.tenantKey, auth.accessToken, auth.refreshToken]);

  const [formData, setFormData] = useState({
    date: dayjs(), paidAccNo: "", paidAccName: "", refNo: "", remark: "", invoiceNo: "",
  });
  const [paymentRows, setPaymentRows] = useState([]);
  const [accountBalance, setAccountBalance] = useState({ amountBalance: 0, goldBalance: 0 });
  const [pettyAccounts, setPettyAccounts] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [validationPopup, setValidationPopup] = useState({ show: false, message: "" });
  const [listOpen, setListOpen] = useState(false);
  const [listRows, setListRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const showMessage = (message) => setValidationPopup({ show: true, message: String(message || "") });

  const onSessionRefreshed = (r) => dispatch(sessionRefreshed(r));

  useEffect(() => {
    if (!session.accessToken || !session.tenantKey) return;
    let cancelled = false;
    setLoadingAccounts(true);
    Promise.all([
      pcvApi.getPettyCashAccounts({ session, onSessionRefreshed }),
      pcvApi.searchAccounts({ search: "", page: 1, pageSize: 100, session, onSessionRefreshed }),
    ]).then(([cash, accounts]) => {
      if (cancelled) return;
      const cashRows = Array.isArray(cash) ? cash : [];
      setPettyAccounts(legacyOptions(cashRows));
      setExpenseAccounts(legacyOptions(accounts?.items || []));
      const preferred = cashRows.find((x) => x.isDefault) || cashRows[0];
      if (preferred) setFormData((p) => p.paidAccNo ? p : ({ ...p, paidAccNo: preferred.accountNo, paidAccName: preferred.accountName }));
    }).catch((e) => showMessage(e.message)).finally(() => !cancelled && setLoadingAccounts(false));
    return () => { cancelled = true; };
  }, [session.accessToken, session.tenantKey]);

  useEffect(() => {
    if (!session.accessToken || !session.tenantKey || !formData.paidAccNo) {
      setAccountBalance({ amountBalance: 0, goldBalance: 0 });
      return;
    }
    const controller = new AbortController();
    getAccountBalance({
      accountNo: formData.paidAccNo,
      session,
      signal: controller.signal,
      onSessionRefreshed,
    }).then((balance) => {
      setAccountBalance({
        amountBalance: Number(balance?.amountBalance ?? 0),
        goldBalance: Number(balance?.goldBalance ?? 0),
      });
    }).catch((error) => {
      if (error?.name !== "AbortError") showMessage(error?.message || "Unable to load account balance.");
    });
    return () => controller.abort();
  }, [formData.paidAccNo, session.accessToken, session.tenantKey]);

  useEffect(() => {
    if (!routeVoucherNo || !session.accessToken || !session.tenantKey) return;
    const controller = new AbortController();
    setListLoading(true);
    pcvApi.getPettyCashExpense({ voucherNo: routeVoucherNo, session, signal: controller.signal, onSessionRefreshed })
      .then((data) => {
        const h = data?.header || {};
        setFormData({
          date: h.voucherDate ? dayjs(h.voucherDate) : dayjs(),
          paidAccNo: h.cashAccountNo || "", paidAccName: h.cashAccountName || "",
          refNo: h.manualNo || "", remark: h.remarks || "", invoiceNo: h.voucherNo || routeVoucherNo,
        });
        setPaymentRows((data?.items || []).map((x) => ({
          accountNo: x.accountNo || "", accountName: x.accountName || "", narration: x.narration || "", amount: Number(x.amount || 0),
        })));
        setErrors({});
      })
      .catch((e) => { if (e?.name !== "AbortError") showMessage(e.message || "Unable to retrieve petty cash expense."); })
      .finally(() => setListLoading(false));
    return () => controller.abort();
  }, [routeVoucherNo, session.accessToken, session.tenantKey]);

  const totalAmount = paymentRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const handleFormChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    if (!formData.paidAccNo) nextErrors.paidAccNo = "Select the petty cash account.";
    if (!formData.date) nextErrors.date = "Voucher date is required.";
    if (!paymentRows.length) nextErrors.items = "Add at least one expense entry.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { showMessage(Object.values(nextErrors).join("\n")); return; }

    const request = {
      header: {
        voucherDate: dayjs(formData.date).format("YYYY-MM-DD"),
        cashAccountNo: formData.paidAccNo,
        manualNo: formData.refNo || "",
        remarks: formData.remark || "",
      },
      items: paymentRows.map((row, index) => ({
        lineNo: index + 1,
        accountNo: String(row.accountNo || "").trim(),
        narration: row.narration || "",
        amount: Number(row.amount || 0),
      })),
    };

    setSaving(true);
    try {
      const result = await pcvApi.savePettyCashExpense({ request, session, onSessionRefreshed });
      setFormData((p) => ({ ...p, invoiceNo: result.voucherNo }));
      showMessage(result.posted
        ? `Petty cash expense ${result.voucherNo} saved and posted successfully.`
        : result.message || `Petty cash expense ${result.voucherNo} saved; posting requires attention.`);
    } catch (e) { showMessage(e.message); }
    finally { setSaving(false); }
  };

  const handleList = async () => {
    setListLoading(true);
    try {
      const date = dayjs(formData.date || dayjs()).format("YYYY-MM-DD");
      const data = await pcvApi.listPettyCashExpenses({ date, session, onSessionRefreshed });
      setListRows(Array.isArray(data) ? data : []);
      setListOpen(true);
    } catch (e) { showMessage(e.message); }
    finally { setListLoading(false); }
  };

  const handleSelectVoucher = async (row) => {
    setListOpen(false);
    setListLoading(true);
    try {
      const data = await pcvApi.getPettyCashExpense({ voucherNo: row.voucherNo, session, onSessionRefreshed });
      const h = data?.header || {};
      setFormData({
        date: h.voucherDate ? dayjs(h.voucherDate) : dayjs(),
        paidAccNo: h.cashAccountNo || "",
        paidAccName: h.cashAccountName || "",
        refNo: h.manualNo || "",
        remark: h.remarks || "",
        invoiceNo: h.voucherNo || row.voucherNo || "",
      });
      setPaymentRows((data?.items || []).map((x) => ({
        accountNo: x.accountNo || "", accountName: x.accountName || "",
        narration: x.narration || "", amount: Number(x.amount || 0),
      })));
      setErrors({});
    } catch (e) { showMessage(e.message); }
    finally { setListLoading(false); }
  };

  const clearForm = () => {
    const selected = pettyAccounts.find((x) => x.fldID === formData.paidAccNo) || pettyAccounts[0];
    setFormData({ date: dayjs(), paidAccNo: selected?.fldID || "", paidAccName: selected ? selected.fldDisplay.replace(`${selected.fldID} `, "") : "", refNo: "", remark: "", invoiceNo: "" });
    setPaymentRows([]); setErrors({});
  };

  return <div className="main-section">
    <MainHeading heading={`Petty cash Expense Invoice${formData.invoiceNo ? ` - ${formData.invoiceNo}` : ""}`} />
    <Paper className="custom-card_001" bgcolor={theme.palette.background.default} sx={{ maxWidth: "100%", width: "100%", textAlign: "center" }}>
      <Box sx={{ p: 2 }}>
        <CustomerDetailVoucherForm
          data={{}}
          formData={formData}
          errors={errors}
          onFormChange={handleFormChange}
          type="PCE"
          currencyList={[]}
          accountType={pettyAccounts}
          accountBalance={accountBalance}
        />
      </Box>
      <Divider />
      {(saving || loadingAccounts || listLoading) && <Loader />}
      <Box sx={{ p: 1 }}>
        <Grid size={{ xs: 12 }}>
          <PaymentBreakdownPCE
            paymentRows={paymentRows}
            setPaymentRows={setPaymentRows}
            netAmount={0}
            paymentOptions={[]}
            accountType={expenseAccounts}
            setRemainingBalance={() => {}}
            remainingBalance={0}
            type="PCE"
            currencyList={[]}
          />
        </Grid>
        <Box sx={{ textAlign: "right", pr: 3, pt: 2, fontWeight: 700 }}>Total Expense: {totalAmount.toFixed(3)}</Box>
      </Box>
      <FooterButtonsGroup
        isEdit={false}
        isSaving={saving}
        handleSave={handleSubmit}
        setFormData={setFormData}
        setRows={() => {}}
        setRemainingAmount={() => {}}
        setDataReady={() => {}}
        setRemarks={() => {}}
        setDiscount={() => {}}
        setPaymentRows={setPaymentRows}
        setErrors={setErrors}
        rows={[]}
        discount={0}
        paymentRows={paymentRows}
        remarks={formData.remark}
        remainingAmount={0}
        type="GFS"
        handleList={handleList}
        handleDelete={clearForm}
      />
      <Popup
        show={validationPopup.show}
        setShow={(val) => setValidationPopup((p) => ({ ...p, show: val }))}
        description={validationPopup.message}
        handleConfirm={() => setValidationPopup((p) => ({ ...p, show: false }))}
        okOnly={true}
      />
      <InvoicePopup
        open={listOpen}
        title="Petty Cash Expense List"
        columns={[
          { key: "voucherNo", label: "PCV No" },
          { key: "voucherDateDisplay", label: "Date" },
          { key: "manualNo", label: "Ref No" },
          { key: "cashAccountName", label: "Paid Account" },
          { key: "totalAmountDisplay", label: "Amount" },
          { key: "statusDisplay", label: "Status" },
        ]}
        data={listRows.map((x) => ({ ...x, voucherDateDisplay: x.voucherDate ? dayjs(x.voucherDate).format("DD/MM/YYYY") : "", totalAmountDisplay: Number(x.totalAmount || 0).toFixed(3), statusDisplay: x.isPosted ? "Posted" : "Un-Posted" }))}
        keyField="voucherNo"
        onClose={() => setListOpen(false)}
        onSelect={handleSelectVoucher}
      />
    </Paper>
  </div>;
}
