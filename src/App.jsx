import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Auth Guards
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// POS (no sidebar/layout)
import Checkout from './pages/pos/Checkout';
import PrintInvoice from './pages/pos/PrintInvoice';

// Products
import Products from './pages/products/Products';
import ProductCreate from './pages/products/Create';
import ProductEdit from './pages/products/Edit';

// Categories
import Categories from './pages/categories/Categories';
import CategoryCreate from './pages/categories/Create';
import CategoryEdit from './pages/categories/Edit';

// Customers
import Customer from './pages/customers/Customer';
import CustomerCreate from './pages/customers/Create';
import CustomerEdit from './pages/customers/Edit';

// Staff
import Staff from './pages/staff/Staff';
import StaffCreate from './pages/staff/Create';
import StaffEdit from './pages/staff/Edit';

// Stores
import Store from './pages/stores/Store';
import StoreCreate from './pages/stores/Create';
import StoreEdit from './pages/stores/Edit';

// Inventory
import Inventory from './pages/inventory/Inventory';
import InventoryLowStock from './pages/inventory/LowStock';
import InventoryRestock from './pages/inventory/Restock';
import InventoryRestockSuccess from './pages/inventory/RestockSuccess';

// Reports
import Reports from './pages/reports/Reports';
import ReportDaily from './pages/reports/Daily';
import ReportMonthly from './pages/reports/Monthly';
import ReportCustom from './pages/reports/Custom';
import ReportStock from './pages/reports/Stock';
import ReportLowStock from './pages/reports/LowStock';

// Promo Codes
import PromoCodes from './pages/promocodes/PromoCodes';
import PromoCodeCreate from './pages/promocodes/Create';
import PromoCodeEdit from './pages/promocodes/Edit';

// BNPL
import Bnpl from './pages/bnpl/Bnpl';
import BnplDetails from './pages/bnpl/Details';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          {/* Standalone POS Routes — No Sidebar/Header Layout */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/invoice/:id" element={<PrintInvoice />} />

          {/* Protected Routes inside Layout (Sidebar + Header) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Roles: Admin, Manager, Cashier (All authenticated users) */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bnpl" element={<Bnpl />} />
            <Route path="bnpl/details/:id" element={<BnplDetails />} />
            <Route path="customers" element={<Customer />} />
            <Route path="customers/create" element={<CustomerCreate />} />
            <Route path="customers/edit/:id" element={<CustomerEdit />} />

            {/* Roles: Admin, Manager ONLY */}
            <Route element={<PrivateRoute allowedRoles={['Admin', 'Manager']} />}>
              <Route path="products" element={<Products />} />
              <Route path="products/create" element={<ProductCreate />} />
              <Route path="products/edit/:id" element={<ProductEdit />} />

              <Route path="categories" element={<Categories />} />
              <Route path="categories/create" element={<CategoryCreate />} />
              <Route path="categories/edit/:id" element={<CategoryEdit />} />

              <Route path="staff" element={<Staff />} />
              <Route path="staff/create" element={<StaffCreate />} />
              <Route path="staff/edit/:id" element={<StaffEdit />} />

              <Route path="reports" element={<Reports />} />
              <Route path="reports/daily" element={<ReportDaily />} />
              <Route path="reports/monthly" element={<ReportMonthly />} />
              <Route path="reports/custom" element={<ReportCustom />} />
              <Route path="reports/stock" element={<ReportStock />} />
              <Route path="reports/lowstock" element={<ReportLowStock />} />

              <Route path="promocodes" element={<PromoCodes />} />
              <Route path="promocodes/create" element={<PromoCodeCreate />} />
              <Route path="promocodes/edit/:id" element={<PromoCodeEdit />} />

              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/restock/:id" element={<InventoryRestock />} />
              <Route path="inventory/lowstock" element={<InventoryLowStock />} />
              <Route path="inventory/restock-success" element={<InventoryRestockSuccess />} />
            </Route>

            {/* Roles: Admin ONLY */}
            <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
              <Route path="stores" element={<Store />} />
              <Route path="stores/create" element={<StoreCreate />} />
              <Route path="stores/edit/:id" element={<StoreEdit />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
