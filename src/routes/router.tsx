import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { SelectContextPage } from "./SelectContextPage";
import { RequireAuth } from "./RequireAuth";
import { AppShell } from "./AppShell";
import { DashboardPage } from "./DashboardPage";
import { NewSaleInvoicePage } from "./NewSaleInvoicePage";
import { NewSalesReturnPage } from "./NewSalesReturnPage";
import { NewScrapPurchasePage } from "./NewScrapPurchasePage";
import { UnfixedSalePage } from "./UnfixedSalePage";
import { UnfixedPurchasePage } from "./UnfixedPurchasePage";
import { SalesGoldFixingVoucherPage } from "./SalesGoldFixingVoucherPage";
import { PurchaseGoldFixingVoucherPage } from "./PurchaseGoldFixingVoucherPage";
import { AccountLookupPage } from "./AccountLookupPage";
import { NewPettyCashExpensePage } from "./NewPettyCashExpensePage";
import { ItemTypesPage } from "./ItemTypesPage";
import { ItemCategoriesPage } from "./ItemCategoriesPage";
import { ItemSubcategoriesPage } from "./ItemSubcategoriesPage";
import { GoldPuritiesPage } from "./GoldPuritiesPage";
import { ItemDesignsPage } from "./ItemDesignsPage";
import { GoldItemListPage } from "./GoldItemListPage";
import { GoldItemFormPage } from "./GoldItemFormPage";
import { ReceiptVoucherPage } from "./ReceiptVoucherPage";
import { PaymentVoucherPage } from "./PaymentVoucherPage";
import { GoldReceiptVoucherPage } from "./GoldReceiptVoucherPage";
import { GoldPaymentVoucherPage } from "./GoldPaymentVoucherPage";
import { CustomerListPage } from "./CustomerListPage";
import { CustomerFormPage } from "./CustomerFormPage";
import { SupplierListPage } from "./SupplierListPage";
import { SupplierFormPage } from "./SupplierFormPage";
import { PaymentTypesPage } from "./PaymentTypesPage";
import { CurrenciesPage } from "./CurrenciesPage";
import { CountriesPage } from "./CountriesPage";
import { AreasPage } from "./AreasPage";
import { SalesmenPage } from "./SalesmenPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/select-context", element: <SelectContextPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/sales/new", element: <NewSaleInvoicePage /> },
          { path: "/sales/returns/new", element: <NewSalesReturnPage /> },
          { path: "/sales/unfixed/new", element: <UnfixedSalePage /> },
          { path: "/sales/gold-fixing/new", element: <SalesGoldFixingVoucherPage /> },
          { path: "/purchases/scrap/new", element: <NewScrapPurchasePage /> },
          { path: "/purchases/unfixed/new", element: <UnfixedPurchasePage /> },
          { path: "/purchases/gold-fixing/new", element: <PurchaseGoldFixingVoucherPage /> },
          { path: "/accounts", element: <AccountLookupPage /> },
          { path: "/finance/petty-cash/new", element: <NewPettyCashExpensePage /> },
          { path: "/settings/item-types", element: <ItemTypesPage /> },
          { path: "/settings/item-categories", element: <ItemCategoriesPage /> },
          { path: "/settings/item-subcategories", element: <ItemSubcategoriesPage /> },
          { path: "/settings/gold-purities", element: <GoldPuritiesPage /> },
          { path: "/settings/item-designs", element: <ItemDesignsPage /> },
          { path: "/items", element: <GoldItemListPage /> },
          { path: "/items/new", element: <GoldItemFormPage /> },
          { path: "/items/:itemId", element: <GoldItemFormPage /> },
          { path: "/finance/receipt-voucher/new", element: <ReceiptVoucherPage /> },
          { path: "/finance/payment-voucher/new", element: <PaymentVoucherPage /> },
          { path: "/finance/gold-receipt-voucher/new", element: <GoldReceiptVoucherPage /> },
          { path: "/finance/gold-payment-voucher/new", element: <GoldPaymentVoucherPage /> },
          { path: "/customers", element: <CustomerListPage /> },
          { path: "/customers/new", element: <CustomerFormPage /> },
          { path: "/customers/:customerId", element: <CustomerFormPage /> },
          { path: "/suppliers", element: <SupplierListPage /> },
          { path: "/suppliers/new", element: <SupplierFormPage /> },
          { path: "/suppliers/:supplierId", element: <SupplierFormPage /> },
          { path: "/settings/payment-types", element: <PaymentTypesPage /> },
          { path: "/settings/currencies", element: <CurrenciesPage /> },
          { path: "/settings/countries", element: <CountriesPage /> },
          { path: "/settings/areas", element: <AreasPage /> },
          { path: "/settings/salesmen", element: <SalesmenPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
