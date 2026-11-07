import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";

/**
 * @param {boolean} open - whether the popup is open
 * @param {string} title - title of the popup
 * @param {Array} columns - array of column config: { key: string, label: string }
 * @param {Array} data - array of data rows (objects)
 * @param {string} keyField - unique field to use as React key (like id)
 * @param {Function} onClose - function to close the popup
 * @param {Function} onSelect - callback when an item is selected
 */
const InvoicePopup = ({
  open,
  title = "Select an item",
  columns = [],
  data = [],
  keyField = "id",
  onClose,
  onSelect,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={row[keyField] || idx}>
                {columns.map((col) => (
                  <TableCell key={col.key}>{row[col.key] ?? "-"}</TableCell>
                ))}
                <TableCell>
                  <Button variant="outlined" onClick={() => onSelect(row)}>
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePopup;
