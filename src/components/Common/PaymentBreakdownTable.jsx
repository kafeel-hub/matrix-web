import React, { useState, useEffect } from "react";
import { IconButton, Menu, MenuItem, Divider } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CustomDropdown from "../Customcomponents/CustomDropdown";
import InputFieldUpdated from "../Customcomponents/CustomInputfield";
import Grid from "@mui/material/Grid2";
import CustomButton from "../Customcomponents/CustomButton";
import CustomDatePicker from "../Customcomponents/CustomDatePicker";
const PaymentBreakdownTable = ({
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
  console.log(paymentRows, "paymentlist");
  // const [paymentRows, setPaymentRows] = useState([]);
  const [newRow, setNewRow] = useState({
    payType: null,
    act: null,
    cheaqueNo: "",
    cheaqueDate: null,
    amount: remainingAmount,
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
  const Actoptions =
    accountType &&
    accountType.map((option) => ({
      label: option.fldDisplay,
      value: option.fldID,
    }));
  const currencies =
    currencyList &&
    currencyList?.dtCurrency?.map((option) => ({
      label: option.CurName,
      value: option.CurId,
    }));
  useEffect(() => {
    let totalPaid = 0;
    if (Array.isArray(paymentRows) && paymentRows.length > 0) {
      totalPaid = paymentRows.reduce((sum, row) => {
        const amount = parseFloat(row.amount) || 0;
        return sum + amount;
      }, 0);

      setRemainingAmount(netAmount - totalPaid);
    } else {
      setRemainingAmount(netAmount);
    }
    console.log(remainingAmount, netAmount, totalPaid, "remaining amount");
  }, [paymentRows, netAmount]);

  useEffect(() => {
    console.log(netAmount, "netAmount");
    if (netAmount !== null && paymentRows.length === 0) {
      setRemainingAmount(netAmount);
      setRemainingBalance(netAmount);
      setNewRow((prevState) => ({
        ...prevState,
        amount: netAmount,
      }));
      setPaymentRows([]);
    }
  }, [netAmount]);

  const handleAddRow = () => {
    if (
      newRow.payType &&
      newRow.amount > 0 &&
      newRow.amount <= remainingAmount
    ) {
      const updatedRemaining = remainingAmount - newRow.amount;
      setPaymentRows([...paymentRows, { ...newRow }]);
      setNewRow({
        payType: null,
        amount: updatedRemaining,
        cheaqueNo: "",
        cheaqueDate: null,
      });
      setRemainingAmount(updatedRemaining);
      setRemainingBalance(updatedRemaining);
      setIsAdding(false);
    }
    if ((type == "GFS" || type == "GFP") && newRow.payType) {
      // const updatedRemaining = remainingAmount - newRow.amount;
      setPaymentRows([...paymentRows, { ...newRow }]);
      setNewRow({
        payType: null,
        amountLC: "",
        cheaqueNo: "",
        cheaqueDate: null,
        amountFC: "",
        currency: null,
        exRate: "",
      });
      // setRemainingAmount(updatedRemaining);
      // setRemainingBalance(updatedRemaining);
      setIsAdding(false);
    }
  };

  const handleEditRow = (index) => {
    const rowToEdit = paymentRows[index];
    setNewRow({ ...rowToEdit });
    setRemainingAmount(remainingAmount + rowToEdit.amount);
    setRemainingBalance(remainingAmount + rowToEdit.amount);

    setPaymentRows(paymentRows.filter((_, i) => i !== index));
    setIsAdding(true);
    setAnchorEl(null);
  };

  const handleDeleteRow = (index) => {
    const deletedRowAmount = paymentRows[index].amount;
    setRemainingAmount(remainingAmount + deletedRowAmount);
    setRemainingBalance(remainingAmount + deletedRowAmount);
    let remaining = paymentRows.filter((_, i) => i !== index);
    setPaymentRows(remaining);
    setNewRow({
      payType: null,
      amount: remainingAmount + deletedRowAmount,
      cheaqueNo: "",
      cheaqueDate: null,
    });

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
  // console.log(paymentRows, "paymentrows");
  return (
    <div>
      {type == "GI" || type == "GR" || type == "GFS" || type == "GFP" ? (
        <>
          <Grid
            container
            spacing={2}
            sx={{
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
              py: 1,
              px: 1,
              backgroundColor: "#00A76F",
              color: "#ffffff",
              borderRadius: 1,
              fontWeight: 600,
            }}
          >
            <Grid
              size={{
                xs: 5,
                md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
              }}
            >
              Payment Type
            </Grid>
            <Grid
              size={{
                xs: 5,
                md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
              }}
            >
              Account
            </Grid>
            <Grid
              size={{
                xs: 5,
                md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
              }}
            >
              Cheaque No
            </Grid>

            <Grid
              size={{
                xs: 5,
                md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
              }}
            >
              Cheaque Date
            </Grid>
            {(type == "GFS" || type == "GFP") && (
              <>
                <Grid
                  size={{
                    xs: 5,
                    md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  }}
                >
                  Amount (LC)
                </Grid>
                <Grid
                  size={{
                    xs: 5,
                    md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  }}
                >
                  Currency
                </Grid>
                <Grid
                  size={{
                    xs: 5,
                    md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  }}
                >
                  EX Rate
                </Grid>
              </>
            )}
            {type == "GFS" || type == "GFP" ? (
              <Grid
                size={{
                  xs: 5,
                  md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                }}
              >
                Amount(FC)
              </Grid>
            ) : (
              <Grid
                size={{
                  xs: 5,
                  md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                }}
              >
                Amount
              </Grid>
            )}

            <Grid
              size={{
                xs: 2,
                md: type == "GFS" || type == "GFP" ? 2 : 2,
                lg: type == "GFS" || type == "GFP" ? 2 : 2,
              }}
            ></Grid>
          </Grid>
          <Divider sx={{ mt: 2 }} />

          <Grid
            spacing={2}
            container
            sx={{ justifyContent: "center", alignItems: "center", mt: 2 }}
          >
            {paymentRows?.map((row, index) => (
              <>
                <Grid
                  size={{
                    xs: 5,
                    md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  }}
                >
                  {row.payType.label}
                </Grid>
                <Grid
                  size={{
                    xs: 5,
                    md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  }}
                >
                  {row?.act?.label}
                </Grid>

                <Grid
                  size={{
                    xs: 5,
                    md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  }}
                >
                  {row.cheaqueNo}
                </Grid>
                <Grid
                  size={{
                    xs: 5,
                    md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  }}
                >
                  {row.cheaqueDate}
                </Grid>
                {(type == "GFS" || type == "GFP" || type == "GFP") && (
                  <>
                    <Grid
                      size={{
                        xs: 5,
                        md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                        lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      }}
                    >
                      {row.amountLC}
                    </Grid>
                    <Grid
                      size={{
                        xs: 5,
                        md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                        lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      }}
                    >
                      {row.currency.label}
                    </Grid>
                    <Grid
                      size={{
                        xs: 5,
                        md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                        lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      }}
                    >
                      {row.exRate}
                    </Grid>
                  </>
                )}
                {type == "GFS" || type == "GFP" || type == "GFP" ? (
                  <Grid
                    size={{
                      xs: 5,
                      md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    }}
                  >
                    {row.amountFC}
                  </Grid>
                ) : (
                  <Grid
                    size={{
                      xs: 5,
                      md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    }}
                  >
                    {row.amount}
                  </Grid>
                )}
                {/* <Grid size={{ xs: 5, md: type == "GFS"||type == "GFP"  ? 1.25 : 2, lg: type == "GFS"||type == "GFP"  ? 1.25 : 2 }}>{row.amount}</Grid> */}
                <Grid
                  size={{
                    xs: type == "GFS" || type == "GFP" ? 2 : 2,
                    md: type == "GFS" || type == "GFP" ? 2 : 2,
                    lg: type == "GFS" || type == "GFP" ? 2 : 2,
                  }}
                >
                  <IconButton onClick={(event) => handleMenuOpen(event, index)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={selectedRow === index}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleEditRow(index)}>
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => handleDeleteRow(index)}>
                      Delete
                    </MenuItem>
                  </Menu>
                </Grid>
              </>
            ))}
          </Grid>
          {isAdding && (
            <Grid
              container
              spacing={6}
              sx={{ justifyContent: "center", alignItems: "center", mt: 2 }}
            >
              <Grid
                size={{
                  xs: 12,
                  md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                }}
              >
                <CustomDropdown
                  options={options}
                  value={newRow.payType}
                  onChange={(_, value) =>
                    setNewRow((prev) => ({
                      ...prev,
                      payType: value,
                    }))
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                }}
              >
                <CustomDropdown
                  options={Actoptions}
                  value={newRow.act}
                  onChange={(_, value) =>
                    setNewRow((prev) => ({
                      ...prev,
                      act: value,
                    }))
                  }
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                }}
              >
                <InputFieldUpdated
                  type={"number"}
                  value={newRow.cheaqueNo}
                  // min={0}
                  // max={cheaqueNo}
                  onChange={(e) =>
                    setNewRow((prev) => ({
                      ...prev,
                      cheaqueNo: Number(e.target.value),
                    }))
                  }
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                }}
              >
                {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}> */}
                <CustomDatePicker
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  // errors={errors}
                />
                {/* </Grid> */}
              </Grid>
              {type == "GFS" || type == "GFP" ? (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    }}
                  >
                    <InputFieldUpdated
                      type={"number"}
                      value={newRow.AmountLC}
                      // min={0}
                      // max={cheaqueNo}
                      onChange={(e) =>
                        setNewRow((prev) => ({
                          ...prev,
                          AmountLC: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    }}
                  >
                    <CustomDropdown
                      options={currencies}
                      value={newRow.currency}
                      onChange={(_, value) =>
                        setNewRow((prev) => ({
                          ...prev,
                          currency: value,
                        }))
                      }
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    }}
                  >
                    <InputFieldUpdated
                      type={"number"}
                      value={newRow.exRate}
                      // min={0}
                      // max={cheaqueNo}
                      onChange={(e) =>
                        setNewRow((prev) => ({
                          ...prev,
                          exRate: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                      lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    }}
                  >
                    <InputFieldUpdated
                      type={"number"}
                      value={newRow.amountFC}
                      // min={0}
                      // max={cheaqueNo}
                      onChange={(e) =>
                        setNewRow((prev) => ({
                          ...prev,
                          amountFC: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>
                </>
              ) : (
                <Grid
                  size={{
                    xs: 12,
                    md: type == "GFS" || type == "GFP" ? 1.25 : 2,
                    lg: type == "GFS" || type == "GFP" ? 1.25 : 2,
                  }}
                >
                  <InputFieldUpdated
                    type={"number"}
                    value={newRow.amount}
                    min={0}
                    max={remainingAmount}
                    onChange={(e) =>
                      setNewRow((prev) => ({
                        ...prev,
                        amount: Number(e.target.value),
                      }))
                    }
                  />
                </Grid>
              )}

              <Grid size={{ xs: 2, md: 2, lg: 2 }}>
                <CustomButton
                  variantType="dark"
                  text="Add"
                  onClick={handleAddRow}
                  disabled={
                    type == "GFS" || type == "GFP"
                      ? !newRow.payType
                      : !newRow.payType ||
                        newRow.amount <= 0 ||
                        newRow.amount > remainingAmount
                  }
                />
              </Grid>
            </Grid>
          )}
          <Grid style={{ marginTop: "10px" }}>
            <Grid size={{ xs: 6, md: 6, lg: 6 }} sx={{ textAlign: "left" }}>
              {((!isAdding && remainingAmount > 0) ||
                type == "GFS" ||
                type == "GFP") && (
                <CustomButton
                  text=" + Add Payment"
                  onClick={() => setIsAdding(true)}
                  sx={{ mt: 2 }}
                  disabled={remainingAmount <= 0}
                />
              )}
            </Grid>

            {remainingAmount === 0 && <p>All payments have been allocated.</p>}
          </Grid>
        </>
      ) : (
        <>
          <Grid
            container
            spacing={2}
            sx={{
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
              py: 1,
              px: 1,
              backgroundColor: "#00A76F",
              color: "#ffffff",
              borderRadius: 1,
              fontWeight: 600,
            }}
          >
            <Grid size={{ xs: 5, md: 5, lg: 5 }}>Payment Type</Grid>
            <Grid size={{ xs: 5, md: 5, lg: 5 }}>Amount</Grid>
            <Grid size={{ xs: 2, md: 2, lg: 2 }}></Grid>
          </Grid>
          <Divider sx={{ mt: 2 }} />

          <Grid
            spacing={4}
            container
            sx={{ justifyContent: "center", alignItems: "center", mt: 2 }}
          >
            {paymentRows.map((row, index) => (
              <>
                <Grid size={{ xs: 5, md: 5, lg: 5 }}>{row.payType.label}</Grid>
                <Grid size={{ xs: 5, md: 5, lg: 5 }}>{row.amount}</Grid>
                <Grid size={{ xs: 2, md: 2, lg: 2 }}>
                  <IconButton onClick={(event) => handleMenuOpen(event, index)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={selectedRow === index}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleEditRow(index)}>
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => handleDeleteRow(index)}>
                      Delete
                    </MenuItem>
                  </Menu>
                </Grid>
              </>
            ))}
          </Grid>
          {isAdding && (
            <Grid
              container
              spacing={6}
              sx={{ justifyContent: "center", alignItems: "center", mt: 2 }}
            >
              <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                <CustomDropdown
                  options={options}
                  value={newRow.payType}
                  onChange={(_, value) =>
                    setNewRow((prev) => ({
                      ...prev,
                      payType: value,
                    }))
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                <InputFieldUpdated
                  type={"number"}
                  value={newRow.amount}
                  min={0}
                  max={remainingAmount}
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
                    !newRow.payType ||
                    newRow.amount <= 0 ||
                    newRow.amount > remainingAmount
                  }
                />
              </Grid>
            </Grid>
          )}
          <Grid style={{ marginTop: "10px" }}>
            <Grid size={{ xs: 6, md: 6, lg: 6 }} sx={{ textAlign: "left" }}>
              {!isAdding && remainingAmount > 0 && (
                <CustomButton
                  text=" + Add Payment"
                  onClick={() => setIsAdding(true)}
                  sx={{ mt: 2 }}
                  // disabled={remainingAmount <= 0}
                />
              )}
            </Grid>

            {remainingAmount === 0 && <p>All payments have been allocated.</p>}
          </Grid>
        </>
      )}
    </div>
  );
};

export default PaymentBreakdownTable;
