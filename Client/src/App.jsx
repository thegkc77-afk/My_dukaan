import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { RepairOrders } from './pages/RepairOrders';
import { CreateOrder } from './pages/CreateOrder';
import { RepairOrderDetails } from './pages/RepairOrderDetails';
import { FindItem } from './pages/FindItem';
import { SalesWarranty } from './pages/SalesWarranty';
import { WarrantyLookup } from './pages/WarrantyLookup';
import { WarrantyClaims } from './pages/WarrantyClaims';
import { HandoverRecords } from './pages/HandoverRecords';
import { Settings } from './pages/Settings';

// Route Guard: Ensures shop owner/staff must be logged in to view dashboard
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="orders/new" element={<CreateOrder />} />
            <Route path="repairs" element={<RepairOrders />} />
            <Route path="repairs/new" element={<CreateOrder />} />
            <Route path="repairs/:id" element={<RepairOrderDetails />} />
            <Route path="find-item" element={<FindItem />} />
            <Route path="sales" element={<SalesWarranty />} />
            <Route path="sales/new" element={<CreateOrder />} />
            <Route path="warranty-lookup" element={<WarrantyLookup />} />
            <Route path="warranty-claims" element={<WarrantyClaims />} />
            <Route path="handovers" element={<HandoverRecords />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
