import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomSelect, { CustomInput } from "../Customcomponents/CustomInputs";
import { StyledTableCell } from "../Ui/StyledTableCell";
import InputFieldUpdated from "../Customcomponents/CustomInputfield";
import CustomButton from "../Customcomponents/CustomButton";

export default function PaymentBreakdown({ netAmount,payType }) {
    const [remainingAmount, setRemainingAmount] = useState(netAmount);
    const initialPaymentRow = { payType: "", amount: remainingAmount };
    const [payments, setPayments] = useState([initialPaymentRow]);

  const handleAddRow = () => {
    setPayments([...payments, initialPaymentRow]);
  };

  const handleDeleteRow = (index) => {
    const updatedPayments = payments.filter((_, i) => i !== index);
    const totalAllocated = updatedPayments.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    setPayments(updatedPayments);
    setRemainingAmount(netAmount - totalAllocated);
  };

  const handleChange = (index, field, value) => {
    const updatedPayments = payments.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );

    const totalAllocated = updatedPayments.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    // Validate the total amount does not exceed the net amount
    if (totalAllocated <= netAmount) {
      setPayments(updatedPayments);
      setRemainingAmount(netAmount - totalAllocated);
    }
  };

  return (
    <div className="payment-breakdown-section" >
      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Pay Type</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((row, index) => (
              <TableRow key={index}>
                <StyledTableCell  className="custom-table-cell">
                  <CustomSelect
                  value={row.payType}
                  onChange={(e) => handleChange(index, "payType", e.target.value)}
                  options={
                    payType?.map((item) => ({
                      value: item.fldID,
                      label: item.fldDisplay,
                    })) || []
                  }
                  // error={!!errors.salesman}
                  // helperText={errors.salesman}
                />
                </StyledTableCell>
                <StyledTableCell className="custom-table-cell w--20">
                  <CustomInput
                    type={"number"}
                    value={row.amount}
                    onChange={(e) => handleChange(index, "amount", e.target.value)}
                    // error={!!errors.amount}
                    // helperText={errors.amount}
                  />
                </StyledTableCell>
                <StyledTableCell className="custom-table-cell">
                  <IconButton onClick={() => handleDeleteRow(index)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CustomButton
        text ="Add Payment Type"
        onClick={handleAddRow}
        sx={{ mt: 2 }}
        disabled={remainingAmount <= 0}
      />
    </div>
  );
}
