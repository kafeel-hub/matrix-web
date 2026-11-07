import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import ThemeProvider from "./contexts/ThemeProvider";
import LoginPage from "./pages/LogInPage";
import CompanyBranch from "./pages/CompanyBranch";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./rotues/PrivateRoute";
import GoldData from "./pages/GoldData";
import ReturnInvoice from "./pages/ReturnInvoice";
import ScrapPurchaseInvoice from "./pages/ScrapPurchaseInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import GoldUnfixedPurchased from "./pages/GoldUnfixedPurchased";
import GoldUnfixedSales from "./pages/GoldUnfixedSales";
import GoldReceiptVoucher from "./pages/GoldReceiptVoucher";
import GoldPaymentVoucher from "./pages/GoldPaymentVoucher";
import SaleGoldfixingVoucher from "./pages/SaleGoldfixingVoucher";
import PurchaseGoldfixingVoucher from "./pages/PurchaseGoldfixingVoucher";
import RecieptVoucher from "./pages/RecieptVoucher";
import PaymentVoucher from "./pages/PaymentVoucher";
import PrettyCashExpenses from "./pages/PrettyCashExpenses";
import CustomerMaster from "./pages/Master/CustomerMaster";
import SupplierMaster from "./pages/Master/SupplierMaster";
import ItemTypeMaster from "./pages/Master/ItemTypeMaster";
import ItemCatMaster from "./pages/Master/ItemCatMaster";
import ItemMaster from "./pages/Master/ItemMaster";
import PaymentTypeMaster from "./pages/Master/PaymentTypeMaster";
import CurrencyMaster from "./pages/Master/CurrencyMaster";
import CountryMaster from "./pages/Master/CountryMaster";
import AreaMaster from "./pages/Master/AreaMaster";
import SalesmanMaster from "./pages/Master/SalesmanMaster";
import GoldPurityMaster from "./pages/Master/GoldPurityMaster";
import ItemSubcategoryMaster from "./pages/Master/ItemSubcategoryMaster";
import ItemDesignMaster from "./pages/Master/ItemDesignMaster";
import { useSelector } from "react-redux";
import SalesInvoice from "./pages/Reports/SalesInvoice";
import DailyReports from "./pages/Reports/DailyReports";

function App() {
  const token = useSelector((state) => state.auth.accessToken || state.auth.token);
  const requiresContextSelection = useSelector((state) => state.auth.requiresContextSelection);

  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    fetch("/meta.json")
      .then((res) => res.json())
      .then((data) => {
        const currentVersion = localStorage.getItem("app_version");
        if (currentVersion && currentVersion !== data.version) {
          setHasUpdate(true);
        }
        localStorage.setItem("app_version", data.version);
      });
  }, []);

  if (hasUpdate) {
    return (
      <div>
        <p>New version available. Reloading...</p>
        {setTimeout(() => window.location.reload(), 2000)}
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" /> : requiresContextSelection ? <Navigate to="/company-branch" /> : <LoginPage />}
          />

          <Route path="/company-branch" element={requiresContextSelection ? <CompanyBranch /> : token ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />

          {/* All Private Routes */}
          <Route
            path="/dashboard"
            element={<PrivateRoute element={<Dashboard />} title="Dashboard" />}
          />
          <Route
            path="/retail-invoice"
            element={<PrivateRoute element={<Home />} />}
          />
          <Route
            path="/gold-data-table"
            element={<PrivateRoute element={<GoldData />} />}
          />
          <Route
            path="/Scrap-purchase-invoice"
            element={<PrivateRoute element={<ScrapPurchaseInvoice />} />}
          />
          <Route
            path="/sales-return-invoice"
            element={<PrivateRoute element={<ReturnInvoice />} />}
          />
          <Route
            path="/invoice-details/:id"
            element={<PrivateRoute element={<InvoiceDetails />} />}
          />
          <Route
            path="/gold-unfixed-purchase/:id?"
            element={<PrivateRoute element={<GoldUnfixedPurchased />} />}
          />
          <Route
            path="/gold-unfixed-sales/:id?"
            element={<PrivateRoute element={<GoldUnfixedSales />} />}
          />

          <Route
            path="/gold-receipt-voucher/:id?"
            element={<PrivateRoute element={<GoldReceiptVoucher />} />}
          />
          <Route
            path="/goldpayment-voucher/:id?"
            element={<PrivateRoute element={<GoldPaymentVoucher />} />}
          />
          <Route
            path="/salegoldfixing-voucher/:id?"
            element={<PrivateRoute element={<SaleGoldfixingVoucher />} />}
          />
          <Route
            path="/purchasegoldfixing-voucher/:id?"
            element={<PrivateRoute element={<PurchaseGoldfixingVoucher />} />}
          />
          <Route
            path="/reciept-voucher"
            element={<PrivateRoute element={<RecieptVoucher />} />}
          />
          <Route
            path="/reciept-voucher/:id"
            element={<PrivateRoute element={<RecieptVoucher />} />}
          />
          <Route
            path="/payment-voucher"
            element={<PrivateRoute element={<PaymentVoucher />} />}
          />
          <Route
            path="/payment-voucher/:id"
            element={<PrivateRoute element={<PaymentVoucher />} />}
          />

          <Route
            path="/sales-report"
            element={<PrivateRoute element={<SalesInvoice />} />}
          />
          <Route
            path="/daily-reports"
            element={<PrivateRoute element={<DailyReports />} title="Daily Reports" />}
          />
          <Route
            path="/prettycashexpenses"
            element={<PrivateRoute element={<PrettyCashExpenses />} />}
          />
          <Route
            path="/prettycashexpenses/:id"
            element={<PrivateRoute element={<PrettyCashExpenses />} />}
          />
          <Route
            path="/master-customer"
            element={<PrivateRoute element={<CustomerMaster />} />}
          />
          <Route
            path="/master-supplier"
            element={<PrivateRoute element={<SupplierMaster />} />}
          />
          <Route
            path="/master-item-category"
            element={<PrivateRoute element={<ItemCatMaster />} />}
          />
          <Route
            path="/master-item-type"
            element={<PrivateRoute element={<ItemTypeMaster />} />}
          />

          <Route path="/master-payment-type" element={<PrivateRoute element={<PaymentTypeMaster />} />} />
          <Route path="/master-currency" element={<PrivateRoute element={<CurrencyMaster />} />} />
          <Route path="/master-country" element={<PrivateRoute element={<CountryMaster />} />} />
          <Route path="/master-area" element={<PrivateRoute element={<AreaMaster />} />} />
          <Route path="/master-salesman" element={<PrivateRoute element={<SalesmanMaster />} />} />
          <Route path="/master-gold-purity" element={<PrivateRoute element={<GoldPurityMaster />} />} />
          <Route path="/master-item-subcategory" element={<PrivateRoute element={<ItemSubcategoryMaster />} />} />
          <Route path="/master-item-design" element={<PrivateRoute element={<ItemDesignMaster />} />} />
          <Route
            path="/master-item"
            element={<PrivateRoute element={<ItemMaster />} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
