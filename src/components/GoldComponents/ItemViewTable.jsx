import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { StyledTableCell } from "../Ui/StyledTableCell";
import { styled } from "@mui/material/styles";

const ItemViewTable = ({
  columns,
  rows,
  onEdit,
  onDelete,
  type,
  errors = {},
}) => {
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },

    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  const checkErrorHandler = (item, name) => {
    if (!item || typeof item !== "object") return false;
    return name in item;
  };

  return (
    <TableContainer component={Box} style={{ marginTop: "0px" }}>
      <Table>
        <TableHead
          sx={{
            background: (theme) =>
              theme.palette.table.default,
            color: (theme) => theme.palette.table.text,
          }}
        >
          <TableRow sx={{ color: (theme) => theme.palette.table.text }}>
            {columns.map((col) => (
              <StyledTableCell key={col.key}>{col.label}</StyledTableCell>
            ))}
            <StyledTableCell>Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <StyledTableRow key={row.id}>
              {columns.map((col) => (
                <StyledTableCell
                  key={col.key}
                  className={`${
                    checkErrorHandler(errors[index] && errors[index], col.key)
                      ? "col-error"
                      : ""
                  }`}
                >
                  {col.key == "itemCode"
                    ? row[col.key] && row[col.key].value
                    : row[col?.key]}

                  {/* {row[col.key]} */}
                </StyledTableCell>
              ))}
              <StyledTableCell>
                <IconButton color="primary" onClick={() => onEdit(index)}>
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(index)}>
                  <Delete />
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ItemViewTable;
