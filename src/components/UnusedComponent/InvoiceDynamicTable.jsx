import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography,Box
  } from '@mui/material';
import CustomDropdown from '../Customcomponents/CustomDropdown';
import PaymentBreakdown from '../GoldComponents/PaymentBreakdown';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from '@mui/material/Grid2';
import InputFieldUpdated from '../Customcomponents/CustomInputfield';
import { calculateGoldRetailPricePerGm,calculateGoldRetailAmount,calculateMCGM,calculateGoldRetailPrice } from '../../utilities/TableCalculations/GoldRetail';
import { CustomInput } from '../Customcomponents/CustomInputs';
import DiscountSection from '../GoldComponents/DiscountSection';
import {StyledTableCell} from "../Ui/StyledTableCell"

export default function InvoiceDynamicTable({ fieldData, fetchProductDetails,rows,setRows,initialRow }) {


      
    const [discount, setDiscount] = useState(0);
    const [remarks, setRemarks] = useState('');
  
    const totalAmount = rows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
    const netAmount = totalAmount - parseFloat(discount || 0);
  
  const handleAddRow = () => {
    setRows([...rows, initialRow]);
  };

  const handleDeleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSelectChange = (index, value) => {
    const updatedRows = rows.map((row, i) => i === index ? { ...row, itemCode: value } : row);
    setRows(updatedRows);
    fetchProductDetails(value);
  };

const handleChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) => {
      if (i === index) {
        const updatedRow = { ...row, [field]: value };

        if (field === "grossWt" || field === "stoneWt") {
          updatedRow.netWt =
            parseFloat(updatedRow.grossWt || 0) - parseFloat(updatedRow.stoneWt || 0);
        }

        if (
          ["grossWt", "stoneWt", "goldPrice", "stoneAmount","mcPerGm","qty"].includes(field)
        ) {
          updatedRow.unitPricePerGm = calculateGoldRetailPricePerGm({
            grossWgt: updatedRow.grossWt,
            stoneWgt: updatedRow.stoneWt,
            goldPrice: updatedRow.goldPrice,
            stoneAmount: updatedRow.stoneAmount,
            mcgm: updatedRow.mcPerGm,
            digits: 3,
          });
          updatedRow.price = calculateGoldRetailPrice({
            grossWgt: updatedRow.grossWt,
            stoneWgt: updatedRow.stoneWt,
            goldPrice: updatedRow.goldPrice,
            stoneAmount: updatedRow.stoneAmount,
            mcgm: updatedRow.mcPerGm,
            digits: 3,
          });
          updatedRow.amount = calculateGoldRetailAmount({
            price: updatedRow.price,
            qty: updatedRow.qty,
            digits: 3,
          });
        }
        return updatedRow;
      }
      return row;
    });
    setRows(updatedRows);
  };

  const checkDisabled =(field)=>{
    switch (field) {
        case 'purity':
            return true
        case 'netWt':
            return true
        
        case 'unitPricePerGm':
                return true

        case 'amount':
            return true
        case 'price':
            return true
        default:
            break;
    }
  }
  return (
    <>
    <TableContainer  sx={{ maxWidth: '100%', overflowX: 'auto' }}>
    <Box sx={{p:2}}>
          <Typography  sx={{textAlign:"left"}} component={"h3"}>
           Details
          </Typography>
          </Box>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>S. No.</StyledTableCell>
            <StyledTableCell>Product</StyledTableCell>
            <StyledTableCell>Description</StyledTableCell>
            <StyledTableCell>Purity</StyledTableCell>
            <StyledTableCell>Qty</StyledTableCell>
            <StyledTableCell>Gross Wt</StyledTableCell>
            <StyledTableCell>Stone Wt</StyledTableCell>
            <StyledTableCell>Net Wt</StyledTableCell>
            <StyledTableCell>Gold Price</StyledTableCell>
            <StyledTableCell>MC/gm</StyledTableCell>
            <StyledTableCell>Unit Price/Gm</StyledTableCell>
            <StyledTableCell>Stone Amount</StyledTableCell>
            <StyledTableCell>Price</StyledTableCell>
            <StyledTableCell>Amount</StyledTableCell>
            <StyledTableCell></StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="custom-table-cell w--15">
              <CustomDropdown
                  id={`itemCode-${index}`}
                  value={fieldData && fieldData.items.find(item=> item.fldID ==row.itemCode )}
                  onChange={(_, value) => handleSelectChange(index, value?.fldID || '')}
                  options={fieldData && fieldData.items.map(item => ({ ...item, label: item.fldDisplay }))}
                />
              </TableCell>
              {Object.keys(initialRow).filter(field => field !== 'itemCode').map((field) => (
                <TableCell key={field} className={`custom-table-cell ${field=="description"?"w--15":""}`}>
                  
                  <InputFieldUpdated
                    type={field =="description"?"text":"number"}
                    value={row[field]}
                    onChange={(e) => handleChange(index, field, e.target.value)}
                    min={0}
                    disabled = {checkDisabled(field)}
                  />
                </TableCell>
              ))}
              <TableCell>
              <IconButton onClick={() => handleDeleteRow(index)}>
                    <DeleteIcon color="error" />
                  </IconButton>
       
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        onClick={handleAddRow}
        variant="outlined"
        sx={{ mt: 2, alignSelf: "flex-start" }}
        startIcon={<AddIcon />}
      >
        Add Item
      </Button>
    </TableContainer>
    </>
  );
}


