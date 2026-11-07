import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import CustomIconButton from "../Customcomponents/CustomIconButton";
import { StyledTableCell } from "../Ui/StyledTableCell";
import CustomButton from "../Customcomponents/CustomButton";

const InvoiceView = ({
  onEdit,
  onDownload,
  onPrint,
  invoiceData,
  onShare,
}) => {
  return (
    <>
      <div id="invoice-container">
      <Paper
        className="custom-card_001"
        // bgcolor={theme.palette.background.default}
        sx={{
          // maxWidth: "100%",
          width: "100%",
          textAlign: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Box sx={{ padding: 4 }}>
          <div className="invoice-header">
            <div className="btn-grp header-buttons">
              <CustomIconButton
                onClick={onEdit}
                Icon={EditIcon}
                iconSize={"sm"}
              />
                  
                  <CustomIconButton onClick={onDownload}  Icon={FileDownloadIcon} iconSize={"sm"} />
                  {/* <CustomIconButton onClick={onPrint} Icon={PrintIcon} iconSize={"sm"} /> */}
                  <CustomIconButton onClick={onShare} Icon={ShareIcon} iconSize={"sm"} />
            </div>
          </div>
          <Grid
            container
            spacing={2}
            sx={{ flexGrow: 1, py: 2, textAlign: "left" }}
          >
            {/* <Grid container spacing={3}> */}
            {/* <Grid item xs={12} sm={6}>/ */}
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <div className="invoice-header-details-box">
                <Typography>
                  <strong>Invoice No:</strong>{" "}
                  {invoiceData && invoiceData.formData?.invoiceNo}
                </Typography>
                <Typography>
                  <strong>Date:</strong>{" "}
                  {invoiceData && invoiceData.formData?.date}
                </Typography>
                <Typography>
                  <strong>Location:</strong>{" "}
                  {invoiceData && invoiceData.formData?.location}
                </Typography>
                <Typography>
                  <strong>Salesman:</strong>{" "}
                  {invoiceData && invoiceData.formData?.salesman}
                </Typography>
              </div>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <div className="invoice-header-details-box">
                <Typography>
                  <strong>Customer Name:</strong>{" "}
                  {invoiceData && invoiceData.formData?.customerName}
                </Typography>
                <Typography>
                  <strong>Phone:</strong>{" "}
                  {invoiceData && invoiceData.formData?.mobile}
                </Typography>
                <Typography>
                  <strong>Nationality:</strong>{" "}
                  {invoiceData && invoiceData.formData?.nationality}
                </Typography>
                <Typography>
                  <strong>Area:</strong>{" "}
                  {invoiceData && invoiceData.formData?.area}
                </Typography>
              </div>
            </Grid>
          </Grid>

          <Divider sx={{ marginY: 3 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Sr. No.</StyledTableCell>
                  <StyledTableCell>Item Code</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell>Purity</StyledTableCell>
                  <StyledTableCell>Gold Price</StyledTableCell>
                  <StyledTableCell>Qty</StyledTableCell>
                  <StyledTableCell>Gross Wt</StyledTableCell>
                  <StyledTableCell>Stone Wt</StyledTableCell>
                  <StyledTableCell>Net Wt</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                </TableRow>
              </TableHead>  
              <TableBody>
                {invoiceData &&
                  invoiceData.itemsDetails.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.itemCode?.label}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.purity}</TableCell>
                      <TableCell>{item.goldPrice}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{item.grossWt}</TableCell>
                      <TableCell>{item.stoneWt}</TableCell>
                      <TableCell>{item.netWt}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={2} sx={{ flexGrow: 1, py: 4 }}>
            <Grid size={{ xs: 12, md: 5, lg: 5 }}>
              <Typography variant="h6">Payment Details</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Payment Type</StyledTableCell>
                      <StyledTableCell>Amount</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData?.paymentDetails?.paymentDetails?.length > 0 ? (
                      invoiceData.paymentDetails.paymentDetails.map(
                        (payment, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {payment.payType?.label || "N/A"}
                            </TableCell>
                            <TableCell>{payment?.amount || "0.00"}</TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} style={{ textAlign: "center" }}>
                          No payment details available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid
              size={{ xs: 12, md: 4, lg: 4 }}
              offset={{ sx: 0, md: 3, lg: 3 }}
            >
              <Box sx={{ textAlign: "right" }}>
                <Typography className="view-invoice-payment">
                  <strong>Total Amount:</strong>{" "}
                  {invoiceData && invoiceData.totalAmount}
                </Typography>
                <Typography className="view-invoice-payment">
                  <strong>Discount:</strong>{" "}
                  {invoiceData && invoiceData.discount}
                </Typography>
                <Typography className="view-invoice-payment">
                  <strong>Net Amount:</strong>{" "}
                  {invoiceData && invoiceData.netAmount}
                </Typography>
                <Typography className="view-invoice-payment">
                  <strong>Remarks:</strong>{" "}
                  {invoiceData && invoiceData.remarks
                    ? invoiceData.remarks
                    : "N/A"}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box className="footer-buttons">
            <Grid
              container
              spacing={2}
              sx={{
                marginTop: 4,
                textAlign: "center",
                justifyContent: "center",
              }}
            >
              <Grid size={{ xs: 12, md: 3, lg: 3 }}>
                <CustomButton
                  text={"Edit"}
                  variant="contained"
                  // theme={theme}
                  fullWidth
                  // sx={{ mt: 2 }}
                  variantType="dark"
                  onClick={onEdit}
                  BtnIcon={EditIcon}
                  // // disabled={loginLoading}
                  // loading={isSaving}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3, lg: 3 }}>
                <CustomButton
                  text={"Download"}
                  variant="contained"
                  // theme={theme}
                  fullWidth
                  // sx={{ mt: 2 }}
                  variantType="dark"
                  onClick={onDownload}
                  BtnIcon={FileDownloadIcon}
                  className="custom-primary-button no-print"
                  // // disabled={loginLoading}
                  // loading={isSaving}
                />
              </Grid>
              {/* <Grid size={{ xs: 12, md: 3, lg: 3 }}>
                <CustomButton
                  text={"Print"}
                  variant="filled"
                  fullWidth
                  onClick={onPrint}
                  BtnIcon={PrintIcon}
                />
              </Grid> */}
            </Grid>
          </Box>
        </Box>
      </Paper>
      </div>
    </>
  );
};

export default InvoiceView;
