import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  Box,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Download, Print, SaveAlt } from "@mui/icons-material";
const ReportCommonTable = ({ rows, columns }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const ccyFormat = (num) => parseFloat(num).toFixed(2);

  const columnTotals = {};
  columns.forEach((col) => {
    if (col.type === "number") {
      columnTotals[col.field] = rows.reduce(
        (sum, row) => sum + (Number(row[col.field]) || 0),
        0
      );
    }
  });

  const subtotal = rows.reduce(
    (sum, row) => sum + parseFloat(row.price || 0),
    0
  );
  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Footer table data
  const goldTable = [
    { type: "24K", weight: "50g" },
    { type: "22K", weight: "30g" },
  ];

  const silverTable = [
    { type: "Sterling", weight: "100g" },
    { type: "Pure", weight: "200g" },
  ];

  const diamondTable = [
    { type: "VVS1", weight: "1.5" },
    { type: "VS2", weight: "0.8" },
  ];

  const handleExportCSV = () => {
    const csvHeader = columns.map((col) => col.headerName).join(",");
    const csvRows = rows.map((row) =>
      columns.map((col) => row[col.field]).join(",")
    );
    const totalRow = columns
      .map((col, index) =>
        index === 0
          ? "Grand Total"
          : columnTotals[col.field] !== undefined
          ? ccyFormat(columnTotals[col.field])
          : ""
      )
      .join(",");

    const goldData = [
      "\n\nGold Summary",
      "Type,Weight",
      ...goldTable.map((item) => `${item.type},${item.weight}`),
    ];
    const silverData = [
      "\n\nSilver Summary",
      "Type,Weight",
      ...silverTable.map((item) => `${item.type},${item.weight}`),
    ];
    const diamondData = [
      "\n\nDiamond Summary",
      "Type,Carat",
      ...diamondTable.map((item) => `${item.type},${item.weight}`),
    ];

    const csvContent = [
      csvHeader,
      ...csvRows,
      totalRow,
      ...goldData,
      ...silverData,
      ...diamondData,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePrint = () => {
    window.print();
  };
  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="flex-end" mb={1}>
        <Tooltip title="Export CSV">
          <IconButton
            sx={{
              "&:hover": {
                backgroundColor: "transparent", // remove background color on hover
                color: "inherit", // keep the icon color same on hover
              },
            }}
            onClick={handleExportCSV}
          >
            <SaveAlt />
          </IconButton>
        </Tooltip>

        <Tooltip title="Print">
          <IconButton
            sx={{
              "&:hover": {
                backgroundColor: "transparent", // remove background color on hover
                color: "inherit", // keep the icon color same on hover
              },
            }}
            onClick={handlePrint}
          >
            <Print />
          </IconButton>
        </Tooltip>
      </Stack>
      <div id="printable-area">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ backgroundColor: "#00a76f" }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.field} align={col.headerAlign || "left"}>
                    {col.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((col) => (
                      <TableCell key={col.field} align={col.align || "left"}>
                        {row[col.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              <TableRow sx={{ backgroundColor: "#00a76f" }}>
                {columns.map((col, index) => (
                  <TableCell key={col.field} align={col.align || "left"}>
                    {index === 0 ? (
                      <strong>Grand Total</strong>
                    ) : columnTotals[col.field] !== undefined ? (
                      <strong>{ccyFormat(columnTotals[col.field])}</strong>
                    ) : (
                      ""
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          {/* Summary tables in three columns */}
          <Box display="flex" justifyContent="space-between" mt={4} gap={2}>
            {[
              { title: "Gold", data: goldTable },
              { title: "Silver", data: silverTable },
              { title: "Diamond", data: diamondTable },
            ].map((section) => (
              <Paper key={section.title} sx={{ flex: 1, p: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>{section.title} Type</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {section.title === "Diamond" ? "Carat" : "Weight"}
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.data.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell align="right">{item.weight}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            ))}
          </Box>
        </TableContainer>
      </div>
    </>
  );
};

export default ReportCommonTable;
