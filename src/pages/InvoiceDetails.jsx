import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import InvoiceView from "../components/Common/InvoiceView";
import * as _ from "lodash";
import { connect, useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, Typography } from "@mui/material";
import Loader from "../components/Loader/Loader";
import {
  formatPaymentDetails,
  formatProductDetails,
} from "../utilities/InvoiceDataFormat";
import MainHeading from "../components/Common/MainHeading";
import { getSalesInvoice } from "../services/salesInvoiceApi";
import { getScrapPurchase } from "../services/scrapPurchaseApi";
import { getSalesReturn } from "../services/salesReturnApi";

import { sessionRefreshed } from "../features/auth/authSlice";
function InvoiceDetails({
  authData,
  getInvoiceDetails,
  invoiceDetails,
  comboBox,
  invoiceDetailsLoading,
}) {
  const { id } = useParams();
  const { state } = useLocation();
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const matrixAuth = useSelector((store) => store.auth || {});
  const [newApiLoading, setNewApiLoading] = useState(false);
  // console.log(invoiceDetails, "invoice details");
  useEffect(() => {
    if ((state?.type || "GSAL") !== "GSAL" || !matrixAuth.accessToken) return;
    const controller = new AbortController();
    setNewApiLoading(true);
    getSalesInvoice({
      transactionNo: id,
      session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey },
      signal: controller.signal,
      onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)),
    })
      .then((result) => {
        const h = result.header || {};
        const paymentTypes = comboBox?.paytype || [];
        setInvoice({
          formData: {
            location: authData?.locationName || authData?.locationId || "",
            invoiceNo: h.transactionNo || "",
            date: h.invoiceDate ? new Date(h.invoiceDate).toLocaleDateString("en-GB") : "",
            refNo: h.referenceNo || "",
            salesman: h.salesmanId || "",
            civilId: h.customerCivilId || "",
            mobile: h.customerMobile || h.customerPhone || "",
            customerPhone: h.customerPhone || "",
            customerName: h.customerName || "",
            nationality: h.nationality || "",
            area: h.areaCode || "",
          },
          itemsDetails: (result.items || []).map((x) => ({
            id: x.lineNo,
            itemCode: { label: x.itemId, value: x.itemId },
            description: x.description || "",
            purity: x.purity || 0,
            qty: x.quantity || 0,
            grossWt: x.goldWeight || 0,
            stoneWt: x.stoneWeight || 0,
            netWt: x.netWeight || 0,
            goldPrice: x.goldRate || 0,
            mcPerGm: x.makingRate || 0,
            unitPricePerGm: x.makingCost || 0,
            stoneAmount: x.stoneAmount || 0,
            amount: x.amount || 0,
          })),
          paymentDetails: { paymentDetails: (result.payments || []).map((x) => {
            const match = paymentTypes.find((p) => String(p.fldID) === String(x.paymentTypeId));
            return { payType: { label: match?.fldDisplay || x.paymentTypeId || "Unknown", value: x.paymentTypeId }, amount: x.amount || 0 };
          }) },
          totalAmount: h.totalAmount || 0,
          netAmount: h.netAmount || 0,
          discount: h.discountAmount || 0,
          remark: h.remarks || "",
        });
      })
      .catch((error) => { if (error?.name !== "AbortError") console.error("Sales invoice retrieve failed", error); })
      .finally(() => setNewApiLoading(false));
    return () => controller.abort();
  }, [id, state?.type, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, comboBox, dispatch]);

  useEffect(() => {
    if (state?.type !== "SCRAP" || !matrixAuth.accessToken) return;
    const controller = new AbortController();
    setNewApiLoading(true);
    getScrapPurchase({
      transactionNo: id,
      session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey },
      signal: controller.signal,
      onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)),
    })
      .then((result) => {
        const h = result.header || {};
        const paymentTypes = comboBox?.paytype || [];
        setInvoice({
          formData: {
            location: authData?.locationName || authData?.locationId || "",
            invoiceNo: h.transactionNo || "",
            date: h.invoiceDate ? new Date(h.invoiceDate).toLocaleDateString("en-GB") : "",
            refNo: h.referenceNo || "",
            salesman: h.salesmanId || "",
            civilId: h.customerCivilId || "",
            mobile: h.customerMobile || h.customerPhone || "",
            customerPhone: h.customerPhone || "",
            customerName: h.customerName || "",
            nationality: h.customerCountryCode || "",
            area: h.customerAreaCode || "",
            block: h.customerBlock || "",
            jedda: h.customerJaddah || "",
            street: h.customerStreet || "",
            building: h.customerBuilding || "",
            floor: h.customerFloor || "",
            flat: h.customerFlat || "",
            paciNo: h.customerPaciNo || "",
            goldRate: h.goldRate || 0,
          },
          itemsDetails: (result.items || []).map((x) => ({
            id: x.lineNo,
            itemCode: { label: x.itemId, value: x.itemId },
            description: x.description || "",
            purity: x.purity || 0,
            qty: x.quantity || 0,
            grossWt: x.grossWeight || 0,
            stoneWt: x.stoneWeight || 0,
            netWt: x.netWeight || 0,
            deductionWt: x.deductionWeight || 0,
            deductionPrcnt: x.deductionPercentage || 0,
            pureWeight: x.pureWeight || 0,
            goldPrice: x.goldRate || 0,
            amount: x.amount || 0,
          })),
          paymentDetails: { paymentDetails: (result.payments || []).map((x) => {
            const match = paymentTypes.find((p) => String(p.fldID) === String(x.paymentTypeId));
            return { payType: { label: match?.fldDisplay || x.paymentTypeId || "Unknown", value: x.paymentTypeId }, amount: x.amount || 0 };
          }) },
          totalAmount: h.totalAmount || 0,
          netAmount: h.netAmount || 0,
          discount: h.discountAmount || 0,
          remark: h.remarks || "",
          remarks: h.remarks || "",
        });
      })
      .catch((error) => { if (error?.name !== "AbortError") console.error("Scrap purchase retrieve failed", error); })
      .finally(() => setNewApiLoading(false));
    return () => controller.abort();
  }, [id, state?.type, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, comboBox, dispatch, authData]);

  useEffect(() => {
    if (state?.type !== "GRET" || !matrixAuth.accessToken) return;
    const controller = new AbortController();
    setNewApiLoading(true);
    getSalesReturn({ transactionNo: id, session: { accessToken: matrixAuth.accessToken, refreshToken: matrixAuth.refreshToken, tenantKey: matrixAuth.tenantKey }, signal: controller.signal, onSessionRefreshed: (tokens) => dispatch(sessionRefreshed(tokens)) })
      .then((result) => {
        const h = result.header || {}; const paymentTypes = comboBox?.paytype || [];
        setInvoice({
          formData: { location: authData?.locationName || authData?.locationId || "", invoiceNo: h.transactionNo || "", date: h.invoiceDate ? new Date(h.invoiceDate).toLocaleDateString("en-GB") : "", refNo: h.referenceNo || "", salesman: h.salesmanId || "", civilId: h.customerCivilId || "", mobile: h.customerMobile || h.customerPhone || "", customerPhone: h.customerPhone || "", customerName: h.customerName || "", nationality: h.nationality || "", area: h.areaCode || "", againstInvoice: h.originalInvoiceNo || "" },
          itemsDetails: (result.items || []).map((x) => ({ id: x.lineNo, itemCode: { label: x.itemId, value: x.itemId }, description: x.description || "", purity: x.purity || 0, qty: x.quantity || 0, grossWt: x.goldWeight || 0, stoneWt: x.stoneWeight || 0, netWt: x.netWeight || 0, goldPrice: x.goldRate || 0, mcPerGm: x.makingRate || 0, unitPricePerGm: x.makingCost || 0, stoneAmount: x.stoneAmount || 0, amount: x.amount || 0 })),
          paymentDetails: { paymentDetails: (result.payments || []).map((x) => { const match = paymentTypes.find((q) => String(q.fldID) === String(x.paymentTypeId)); return { payType: { label: match?.fldDisplay || x.paymentTypeId || "Unknown", value: x.paymentTypeId }, amount: x.amount || 0 }; }) },
          totalAmount: h.totalAmount || 0, netAmount: h.netAmount || 0, discount: h.discountAmount || 0, remark: h.remarks || "",
        });
      })
      .catch((error) => { if (error?.name !== "AbortError") console.error("Sales return retrieve failed", error); })
      .finally(() => setNewApiLoading(false));
    return () => controller.abort();
  }, [id, state?.type, matrixAuth.accessToken, matrixAuth.refreshToken, matrixAuth.tenantKey, comboBox, dispatch, authData]);

  // useEffect(() => {
  //   const header = invoiceDetails.InvoiceHeader?.[0] || {};
  //   if (invoiceDetails?.InvoiceHeader?.[0].TranType=="GSAL") {

  //     setInvoice({
  //       formData: {
  //         location: header.LocId || "",
  //         invoiceNo: header.TranNo || "",
  //         date: header.TranDate || "",
  //         refNo: header.TranRefNo || "",
  //         salesman: header.TranSManId || "",
  //         civilId: header.TranPrtCivilId || "",
  //         mobile: header.TranPrtMobile || "",
  //         customerPhone: header.TranPrtPhone || "",
  //         customerName: header.TranPrtName || "",
  //         nationality: header.nationality || "",
  //         area: header.TranPrtArea || "",

  //         againstInvoice: formData.againstInvoice,
  //         TotalAmount: header.TranTotalAmt || 0,
  //         NetAmount: header.TranNetAmt || 0,
  //       },
  //       paymentDetails: formatPaymentDetails(
  //         invoiceDetails.PaymentDetails,
  //         comboBox
  //       ),
  //       itemsDetails: formatProductDetails(invoiceDetails.ProductDetails),
  //       totalAmount: header.TranTotalAmt || 0,
  //       netAmount: header.TranNetAmt || 0,
  //       discount: header.TranDiscAmt || 0,
  //       remark: header.TranRemark1 || "",
  //     });
  //   }
  // }, [invoiceDetails]);
  /* Legacy invoice-detail mapper retained for other transaction types.
  useEffect(() => {
    const header = invoiceDetails.InvoiceHeader?.[0] || {};
    if (invoiceDetails) {
      let formData = {}; // Initialize empty formData

      switch (header.TranType) {
        case "GSAL":
          formData = {
            location: header.LocId || "",
            invoiceNo: header.TranNo || "",
            date: header.TranDate || "",
            refNo: header.TranRefNo || "",
            salesman: header.TranSManId || "",
            civilId: header.TranPrtCivilId || "",
            mobile: header.TranPrtMobile || "",
            customerPhone: header.TranPrtPhone || "",
            customerName: header.TranPrtName || "",
            nationality: header.nationality || "",
            area: header.TranPrtArea || "",
          };
          break;

        case "GRET":
          formData = {
            location: header.LocId || "",
            invoiceNo: header.TranNo || "",
            date: header.TranDate || "",
            refNo: header.TranRefNo || "",
            salesman: header.TranSManId || "",
            civilId: header.TranPrtCivilId || "",
            mobile: header.TranPrtMobile || "",
            customerPhone: header.TranPrtPhone || "",
            customerName: header.TranPrtName || "",
            nationality: header.nationality || "",
            area: header.TranPrtArea || "",
            againstInvoice: header.againstInvoice,
          };
          break;

        case "SCRAP":
          formData = {
            location: header.LocId || "",

            invoiceNo: header.TranNo || "",
            date: header.TranDate || "",

            refNo: header.TranRefNo || "",
            salesman: header.TranSManId || "",
            civilId: header.TranPrtCivilId || "",
            mobile: header.TranPrtMobile || "",
            customerPhone: header.TranPrtPhone || "",
            customerName: header.TranPrtName || "",
            nationality: header.nationality || "",
            area: header.TranPrtArea || "",
            block: header.TranPrtBlock || "",
            jedda: header.TranPrtJedah || "",
            street: header.TranPrtStreet || "",
            building: header.TranPrtBuilding || "",
            floor: header.TranPrtFloor || "",
            flat: header.TranPrtFlat || "",
            paciNo: header.TranPrtPaciNo || "",
            goldRate: "200" || "",
          };
          break;
        case "UGLP":
          formData = {
            location: header.LocId || "",

            invoiceNo: header.TranNo || "",
            date: header.TranDate || "",

            refNo: header.TranRefNo || "",
            salesman: header.TranSManId || "",
            civilId: header.TranPrtCivilId || "",
            mobile: header.TranPrtMobile || "",
            customerPhone: header.TranPrtPhone || "",
            customerName: header.TranPrtName || "",
            nationality: header.nationality || "",
            area: header.TranPrtArea || "",
            block: header.TranPrtBlock || "",
            jedda: header.TranPrtJedah || "",
            street: header.TranPrtStreet || "",
            building: header.TranPrtBuilding || "",
            floor: header.TranPrtFloor || "",
            flat: header.TranPrtFlat || "",
            paciNo: header.TranPrtPaciNo || "",
            goldRate: "200" || "",
          };
          break;
        case "GI":
          formData = {
            location: header.LocId || "",

            invoiceNo: header.TranNo || "",
            date: header.TranDate || "",

            refNo: header.TranRefNo || "",
            supplierRef: header.TranVrNo || "",
            civilId: header.TranPrtCivilId || "",
            mobile: header.TranPrtMobile || "",

            phone: header.TranPrtPersonPhone || "",

            contactPerson: header.TranPrtPerson || "",
            companyCRNo: header.TranPrtCrNo || "",

            party: header.TranPrtId || "",
            partyName: header.TranPrtName || "",
            personPhone: header.TranPrtPersonPhone || "",
            amount: header.Print_CloseAmt || "",
            gold: header.Print_CloseGold || "",
          };
          break;
        case "GR":
          formData = {
            location: header.LocId || "",

            invoiceNo: header.TranNo || "",
            date: header.TranDate || "",

            refNo: header.TranRefNo || "",
            supplierRef: header.TranVrNo || "",
            civilId: header.TranPrtCivilId || "",
            mobile: header.TranPrtMobile || "",

            phone: header.TranPrtPersonPhone || "",

            contactPerson: header.TranPrtPerson || "",
            companyCRNo: header.TranPrtCrNo || "",

            party: header.TranPrtId || "",
            partyName: header.TranPrtName || "",
            personPhone: header.TranPrtPersonPhone || "",
            amount: header.Print_CloseAmt || "",
            gold: header.Print_CloseGold || "",
          };
          break;

        case "GFP":
          formData = {
            location: header.LocId || "",

            invoiceNo: header.TranNo || "",
            date: header.TranDate || "",
            voucherNo: TranNo || "",
            refNo: header.TranRefNo || "",
            customerName: header.TranPrtName || "",
            civilId: header.TranPrtCivilId || "",
            mobile: header.TranPrtMobile || "",
            currency: header.TranCurId || "",
            // phone: header.TranPrtPersonPhone || "",

            // customerName: header.TranPrtName || "",
            companyCRNo: header.TranPrtCrNo || "",
            exRate: header.TranExRate || "",
            pricePerGrm: header.TranGoldRate || "",
            pureGoldPurity: header.TranGoldPurity || "",
            goldWeight: header.TranGoldGrossWgt || "",
            fixingAmount: header.TranGoldAmount || "",
            makingAmount: header.TranMcAmount || "",
            totalAmount: header.TranNetAmt || "",
            // party: header.TranPrtId || "",
            // partyName: header.TranPrtName || "",
            // personPhone: header.TranPrtPersonPhone || "",
            amount: header.Print_CloseAmt || "",
            gold: header.Print_CloseGold || "",
          };
          break;
        default:
          formData = {};
      }
      console.log(
        invoiceDetails,
        formData,
        header,
        invoiceDetails,
        "invoiceDetails"
      );
      setInvoice({
        formData, // FormData is dynamically assigned based on TranType
        paymentDetails: formatPaymentDetails(
          invoiceDetails.PaymentDetails,
          comboBox
        ),
        itemsDetails: formatProductDetails(
          invoiceDetails.ProductDetails,
          header.TranType
        ),
        totalAmount: header.TranTotalAmt || 0,
        netAmount: header.TranNetAmt || 0,
        discount: header.TranDiscAmt || 0,
        remark: header.TranRemark1 || "",
      });
    }
  }, [invoiceDetails]);
  */
  if (!invoice) {
    return <div>Loading...</div>;
  }

  // const handleEdit = () => {
  //   navigate(`/retail-invoice`, {
  //     state: invoice,
  //   });
  // };
  const handleEdit = () => {
    const header = invoiceDetails.InvoiceHeader?.[0] || {};
    const transactionType = state?.type || header.TranType;
    switch (transactionType) {
      case "GSAL":
        navigate(`/retail-invoice`, { state: invoice });
        break;
      case "GRET":
        navigate(`/sales-return-invoice`, { state: invoice });
        break;
      case "SCRAP":
        navigate(`/Scrap-purchase-invoice`, { state: invoice });
        break;
      case "UGLP":
        navigate(`/gold-unfixed-purchase`, { state: invoice });
        break;
      case "GI":
        navigate(`/gold-receipt-voucher`, { state: invoice });
        break;
      case "GR":
        navigate(`/payment-voucher`, { state: invoice });
        break;
      case "GFS":
        navigate(`/salegoldfixing-voucher`, { state: invoice });
        break;
      case "GFP":
        navigate(`/purchasegoldfixing-voucher`, { state: invoice });
        break;
      default:
        navigate(`/retail-invoice`, { state: invoice });
    }
  };
  const handleNavigateBack = () => {
    navigate("/gold-data-table");
  };

  const handleDownload = () => {
    const headerButtons = document.querySelector(".invoice-header");
    const footerButtons = document.querySelector(".footer-buttons");

    if (headerButtons) headerButtons.classList.add("hide");
    if (footerButtons) footerButtons.classList.add("hide");

    const invoiceElement = document.getElementById("invoice-container");

    html2canvas(invoiceElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");

      if (headerButtons) headerButtons.classList.remove("hide");
      if (footerButtons) footerButtons.classList.remove("hide");
    });
  };

  const handlePrint = () => {
    const headerButtons = document.querySelector(".header-buttons");
    const footerButtons = document.querySelector(".footer-buttons");

    if (headerButtons) headerButtons.classList.add("hide-print");
    if (footerButtons) footerButtons.classList.add("hide-print");

    window.print();

    if (headerButtons) headerButtons.classList.remove("hide-print");
    if (footerButtons) footerButtons.classList.remove("hide-print");
  };

  const handleShare = async () => {
    const invoice = document.getElementById("invoice-container");
    if (!invoice) return;

    const doc = new jsPDF();
  };

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          underline="hover"
          color="inherit"
          onClick={handleNavigateBack}
          style={{ cursor: "pointer" }}
        >
          {"Invoice"}
        </Link>
        <Typography color="text.primary">Invoice Details</Typography>
      </Breadcrumbs>
      <MainHeading heading="Invoice Summary" />
      {(invoiceDetailsLoading || newApiLoading) && <Loader />}
      <InvoiceView
        invoiceData={invoice}
        onEdit={() => handleEdit()}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onShare={handleShare}
      />
    </div>
  );
}

const mapStateToProps = ({ auth = {}, demo = {}, invoice = {} }) => ({
  authData: _.get(auth, "authData", {}),
  invoiceDetails: _.get(invoice, "invoiceDetails", {}),
  comboBox: _.get(auth, "comboBox", []),
  invoiceDetailsLoading: _.get(invoice, "invoiceDetailsLoading", false),
});

const mapDispatchToProps = (dispatch) => ({
  getInvoiceDetails: (data) =>
    dispatch({ type: "getInvoiceDetailscalled", payload: data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(InvoiceDetails);
