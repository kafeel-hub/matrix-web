import React, { useState, useEffect } from "react";
import { IconButton, Menu, MenuItem, Divider } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CustomDropdown from "../Customcomponents/CustomDropdown";
import InputFieldUpdated from "../Customcomponents/CustomInputfield";
import Grid from "@mui/material/Grid2";
import CustomButton from "../Customcomponents/CustomButton";
import { CustomInput } from "../Customcomponents/CustomInputs";
import CustomDatePicker from "../Customcomponents/CustomDatePicker";

const PaymentBreakdownPCE = ({
  netAmount,
  paymentOptions,
  setPaymentRows,
  paymentRows,
  type,
  accountType,
  setRemainingBalance,
  currencyList,
}) => {
  const [remainingAmount, setRemainingAmount] = useState(netAmount);
  // newRow now includes accountNo and accountName
  const [newRow, setNewRow] = useState({
    payType: null,
    act: null,
    accountNo: null,
    accountName: null,
    narration: "",
    cheaqueNo: "",
    cheaqueDate: null,
    amount: remainingAmount,
    currency: null,
    exRate: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [date, setDate] = useState(null);

  const options =
    paymentOptions &&
    paymentOptions.map((option) => ({
      label: option.fldDisplay,
      value: option.fldID,
    }));

  // ACT options (raw)
  const ActoptionsRaw =
    accountType &&
    accountType.map((option) => ({
      label: option.fldDisplay, // e.g. "100011 zahir account"
      value: option.fldID, // e.g. "100011" or some id
    }));

  // Derive two lists: one for account number selection (shows full label)
  // and one for account names (shows only name part). The parsing is defensive:
  // if label begins with digits, the first token is treated as account number.
  const ActoptionsForAccountNo = (ActoptionsRaw || []).map((opt) => ({
    label: opt.label,
    value: opt.value,
    // we keep the original label for display but also expose parsed parts
    parsedAccountNo: (() => {
      if (!opt.label) return String(opt.value);
      const firstToken = String(opt.label).trim().split(/\s+/)[0];
      // If the first token contains digits, treat it as account number
      return firstToken.match(/\d/) ? firstToken : String(opt.value);
    })(),
    parsedAccountName: (() => {
      if (!opt.label) return "";
      const s = String(opt.label).trim();
      const firstToken = s.split(/\s+/)[0];
      if (firstToken.match(/\d/)) {
        return s.slice(firstToken.length).trim(); // rest of string
      }
      // fallback: remove value if it equals fldID, else return full label
      return s;
    })(),
  }));

  // account name options (only name part)
  const ActoptionsForAccountName = ActoptionsForAccountNo.map((opt) => ({
    label: opt.parsedAccountName || opt.label,
    value: opt.parsedAccountNo || opt.value,
  }));

  useEffect(() => {
    if (type === "PCE") return;
    if (netAmount !== null) {
      setRemainingAmount(netAmount);
      setRemainingBalance(netAmount);
      setNewRow((prevState) => ({ ...prevState, amount: netAmount }));
      setPaymentRows([]);
    }
  }, [netAmount, setRemainingBalance, setPaymentRows, type]);

  const handleAddRow = () => {
    // validation: require accountNo/accountName for PCE or payType for other types
    if (type === "PCE") {
      if (!newRow.accountNo || !newRow.accountName || !newRow.amount) return;
    } else {
      if (!newRow.payType || !newRow.amount) return;
    }

    // Add the new row and update remaining
    const updatedRemaining = type === "PCE"
      ? 0
      : Number(remainingAmount) - Number(newRow.amount || 0);
    setPaymentRows([...paymentRows, { ...newRow }]);
    setNewRow({
      payType: null,
      act: null,
      accountNo: null,
      accountName: null,
      narration: "",
      amount: updatedRemaining > 0 ? updatedRemaining : 0,
      cheaqueNo: "",
      cheaqueDate: null,
      currency: null,
      exRate: "",
    });
    if (type !== "PCE") {
      setRemainingAmount(updatedRemaining > 0 ? updatedRemaining : 0);
      setRemainingBalance(updatedRemaining > 0 ? updatedRemaining : 0);
    }
    setIsAdding(false);
  };

  const handleEditRow = (index) => {
    const rowToEdit = paymentRows[index];
    setNewRow({ ...rowToEdit });
    const restoredRemaining = Number(remainingAmount) + Number(rowToEdit.amount || 0);
    if (type !== "PCE") {
      setRemainingAmount(restoredRemaining);
      setRemainingBalance(restoredRemaining);
    }
    setPaymentRows(paymentRows.filter((_, i) => i !== index));
    setIsAdding(true);
    setAnchorEl(null);
  };

  const handleDeleteRow = (index) => {
    const deletedRowAmount = Number(paymentRows[index].amount || 0);
    const newRemaining = Number(remainingAmount) + deletedRowAmount;
    if (type !== "PCE") {
      setRemainingAmount(newRemaining);
      setRemainingBalance(newRemaining);
    }
    const remaining = paymentRows.filter((_, i) => i !== index);
    setPaymentRows(remaining);
    setNewRow((prev) => ({
      ...prev,
      accountNo: null,
      accountName: null,
      amount: newRemaining,
      cheaqueNo: "",
      cheaqueDate: null,
    }));
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // When user selects Account Number dropdown:
  const onSelectAccountNumber = (_, selectedOption) => {
    // selectedOption is one of ActoptionsForAccountNo entries
    if (!selectedOption) return;
    const parsedNo = selectedOption.parsedAccountNo || selectedOption.value;
    const parsedName =
      selectedOption.parsedAccountName || selectedOption.label || "";

    setNewRow((prev) => ({
      ...prev,
      accountNo: parsedNo,
      accountName: parsedName,
      act: { label: selectedOption.label, value: selectedOption.value }, // keep raw
    }));
  };

  // When user changes Account Name dropdown (if you let them):
  const onSelectAccountName = (_, selectedOption) => {
    if (!selectedOption) return;
    setNewRow((prev) => ({
      ...prev,
      accountName: selectedOption.label,
      accountNo: selectedOption.value,
    }));
  };

  return (
    <div>
      <Grid
        container
        spacing={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          mt: 0,
          py: 1,
          px: 1,
          backgroundColor: "#00A76F",
          color: "#ffffff",
          borderRadius: 1,
          fontWeight: 600,
        }}
      >
        <Grid size={{ xs: 5, md: 2.5, lg: 2.5 }}>Account Number</Grid>
        <Grid size={{ xs: 5, md: 2.5, lg: 2.5 }}>Account Name</Grid>
        <Grid size={{ xs: 5, md: 2.5, lg: 2.5 }}>Narration</Grid>

        <Grid size={{ xs: 5, md: 2.5, lg: 2.5 }}>Amount</Grid>
        <Grid size={{ xs: 2, md: 2, lg: 2 }}></Grid>
      </Grid>
      <Divider sx={{ mt: 2 }} />

      <Grid
        spacing={4}
        container
        sx={{ justifyContent: "center", alignItems: "center", mt: 2 }}
      >
        {paymentRows.map((row, index) => (
          <React.Fragment key={index}>
            <Grid size={{ xs: 5, md: 2.5, lg: 2.5 }}>
              {row.accountNo || row.payType?.value}
            </Grid>
            <Grid size={{ xs: 5, md: 2.5, lg: 2.5 }}>
              {row.accountName || row.payType?.label}
            </Grid>
            <Grid size={{ xs: 5, md: 2.5, lg: 2.5 }}>{row.narration}</Grid>

            <Grid size={{ xs: 5, md: 2.5, lg: 2.5 }}>{row.amount}</Grid>
            <Grid size={{ xs: 2, md: 2, lg: 2 }}>
              <IconButton onClick={(event) => handleMenuOpen(event, index)}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={selectedRow === index}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleEditRow(index)}>Edit</MenuItem>
                <MenuItem onClick={() => handleDeleteRow(index)}>
                  Delete
                </MenuItem>
              </Menu>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>

      {isAdding && (
        <Grid
          container
          spacing={2}
          sx={{ justifyContent: "center", alignItems: "center", mt: 2 }}
        >
          {/* Account Number dropdown (shows full label e.g. "100011 zahir account") */}
          <Grid size={{ xs: 12, md: 2.5, lg: 2.5 }}>
            <CustomDropdown
              options={ActoptionsForAccountNo}
              value={
                newRow.accountNo
                  ? {
                      label: `${newRow.accountNo} ${
                        newRow.accountNo || ""
                      }`.trim(),
                      value: newRow.accountNo,
                    }
                  : null
              }
              onChange={onSelectAccountNumber}
              // If your CustomDropdown expects option objects with label/value,
              // ActoptionsForAccountNo contains those plus parsed fields.
            />
          </Grid>

          {/* Account Name dropdown — auto-filled from selected account number.
              If you want to prevent user editing the name, set disabled={true} */}
          <Grid size={{ xs: 12, md: 2.5, lg: 2.5 }}>
            <CustomInput
              // options={ActoptionsForAccountName}
              value={newRow.accountName}
              onChange={
                (e) =>
                  setNewRow((prev) => ({
                    ...prev,
                    accountName: e.target.value,
                  }))
                // disabled to force auto-fill only:
                // disabled={true}
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2.5, lg: 2.5 }}>
            <CustomInput
              type={"text"}
              value={newRow.narration}
              onChange={(e) =>
                setNewRow((prev) => ({ ...prev, narration: e.target.value }))
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2.5, lg: 2.5 }}>
            <CustomInput
              type={"number"}
              value={newRow.amount}
              min={0}
              max={type === "PCE" ? undefined : remainingAmount}
              onChange={(e) =>
                setNewRow((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
            />
          </Grid>

          <Grid size={{ xs: 2, md: 2, lg: 2 }}>
            <CustomButton
              variantType="dark"
              text="Add"
              onClick={handleAddRow}
              disabled={
                type === "PCE"
                  ? !newRow.accountNo || !newRow.accountName || Number(newRow.amount) <= 0
                  : !newRow.payType ||
                    newRow.amount <= 0 ||
                    newRow.amount > remainingAmount
              }
            />
          </Grid>
        </Grid>
      )}

      <Grid>
        <Grid size={{ xs: 6, md: 6, lg: 6 }} sx={{ textAlign: "left" }}>
          {((!isAdding && remainingAmount > 0) || type === "PCE") && (
            <CustomButton
              text=" + Add Entry"
              onClick={() => setIsAdding(true)}
            />
          )}
        </Grid>

        {type !== "PCE" && remainingAmount === 0 && <p>All payments have been allocated.</p>}
      </Grid>
    </div>
  );
};

export default PaymentBreakdownPCE;
