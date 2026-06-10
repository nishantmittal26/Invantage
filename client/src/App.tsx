import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from './store';
import { hideAlert } from './store/alertSlice';
import { getTheme } from './theme';

// Layout and Route Guards
import Layout from './components/Layout';
import RouteGuard from './components/RouteGuard';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Units from './pages/Units';
import Suppliers from './pages/Suppliers';
import Warehouses from './pages/Warehouses';
import Products from './pages/Products';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Adjustments from './pages/Adjustments';
import Transfers from './pages/Transfers';
import PurchaseOrders from './pages/PurchaseOrders';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import ChangePassword from './pages/ChangePassword';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector((state) => state.settings);
  const alert = useAppSelector((state) => state.alert);

  const theme = getTheme(mode);

  const handleAlertClose = () => {
    dispatch(hideAlert());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />


          {/* Protected Main App Routes */}
          <Route
            path="/"
            element={
              <RouteGuard>
                <Layout />
              </RouteGuard>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Masters */}
            <Route path="masters/products" element={<Products />} />
            <Route path="masters/categories" element={<Categories />} />
            <Route path="masters/brands" element={<Brands />} />
            <Route path="masters/units" element={<Units />} />
            <Route path="masters/suppliers" element={<Suppliers />} />
            <Route path="masters/warehouses" element={<Warehouses />} />

            {/* Inventory Transactions */}
            <Route path="transactions/stock-in" element={<StockIn />} />
            <Route path="transactions/stock-out" element={<StockOut />} />
            <Route path="transactions/adjustments" element={<Adjustments />} />
            <Route path="transactions/transfers" element={<Transfers />} />

            {/* Purchase Orders */}
            <Route path="purchase-orders" element={<PurchaseOrders />} />

            {/* Reports */}
            <Route path="reports" element={<Reports />} />

            {/* Administration */}
            <Route
              path="admin/users"
              element={
                <RouteGuard requiredRole="MasterAdmin">
                  <Users />
                </RouteGuard>
              }
            />
            <Route
              path="admin/roles"
              element={
                <RouteGuard requiredRole="MasterAdmin">
                  <Roles />
                </RouteGuard>
              }
            />

            {/* Settings */}
            <Route
              path="settings"
              element={
                <RouteGuard requiredRole="MasterAdmin">
                  <Settings />
                </RouteGuard>
              }
            />

            {/* Change Password */}
            <Route
              path="change-password"
              element={
                <RouteGuard>
                  <ChangePassword />
                </RouteGuard>
              }
            />
          </Route>


          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      {/* Global Snackbar Toast Notifications */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
