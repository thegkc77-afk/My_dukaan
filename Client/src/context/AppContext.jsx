import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initializeStorage,
  subscribeToDataChanges,
  getRepairOrders,
  getSalesRecords,
  getWarrantyClaims,
  getHandoverRecords,
  getSettings,
  saveRepairOrder,
  updateRepairOrderStatus,
  deleteRepairOrder,
  saveSalesRecord,
  saveWarrantyClaim,
  updateWarrantyClaimStatus,
  saveHandoverRecord,
  saveSettings,
  resetAllDataToDefault
} from '../utils/storage';
import { getWarrantyStatus } from '../utils/dateUtils';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Ensure seed data initialized
  initializeStorage();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('dukkan_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [repairOrders, setRepairOrders] = useState(getRepairOrders());
  const [salesRecords, setSalesRecords] = useState(getSalesRecords());
  const [warrantyClaims, setWarrantyClaims] = useState(getWarrantyClaims());
  const [handoverRecords, setHandoverRecords] = useState(getHandoverRecords());
  const [settings, setSettingsState] = useState(getSettings());
  const [activeStaff, setActiveStaff] = useState(() => {
    try {
      const stored = localStorage.getItem('dukkan_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) return u.name;
      }
    } catch {}
    return getSettings().staffMembers?.[0] || 'Ramesh Kumar (Owner)';
  });
  const [toasts, setToasts] = useState([]);

  // Sync state whenever localStorage changes
  useEffect(() => {
    const unsubscribe = subscribeToDataChanges(() => {
      setRepairOrders(getRepairOrders());
      setSalesRecords(getSalesRecords());
      setWarrantyClaims(getWarrantyClaims());
      setHandoverRecords(getHandoverRecords());
      const newSettings = getSettings();
      setSettingsState(newSettings);
      if (!newSettings.staffMembers?.includes(activeStaff) && newSettings.staffMembers?.[0]) {
        setActiveStaff(newSettings.staffMembers[0]);
      }
    });
    return unsubscribe;
  }, [activeStaff]);

  // Toast notification helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Quick statistics calculation
  const stats = {
    totalRepairs: repairOrders.length,
    underRepair: repairOrders.filter((o) => o.repairStatus === 'Under Repair').length,
    readyForPickup: repairOrders.filter((o) => o.repairStatus === 'Ready for Pickup').length,
    received: repairOrders.filter((o) => o.repairStatus === 'Received').length,
    completedRepairs: repairOrders.filter((o) => o.repairStatus === 'Completed').length,
    activeWarranties: salesRecords.filter((s) => {
      const st = getWarrantyStatus(s.warrantyExpiryDate);
      return st.isActive;
    }).length,
    pendingClaims: warrantyClaims.filter(
      (c) => c.claimStatus === 'Pending Verification' || c.claimStatus === 'Under Review'
    ).length,
    totalHandovers: handoverRecords.length
  };

  const handleSaveRepairOrder = (order) => {
    const res = saveRepairOrder(order);
    addToast(`Repair Order ${order.id} saved successfully!`, 'success');
    return res;
  };

  const handleUpdateRepairStatus = (id, newStatus, note) => {
    updateRepairOrderStatus(id, newStatus, note);
    addToast(`Order ${id} status updated to ${newStatus}`, 'success');
  };

  const handleDeleteRepairOrder = (id) => {
    deleteRepairOrder(id);
    addToast(`Order ${id} deleted`, 'info');
  };

  const handleSaveSale = (sale) => {
    const res = saveSalesRecord(sale);
    addToast(`Sales & Warranty record ${sale.id} registered!`, 'success');
    return res;
  };

  const handleSaveClaim = (claim) => {
    const res = saveWarrantyClaim(claim);
    addToast(`Warranty Claim ${claim.id} logged!`, 'success');
    return res;
  };

  const handleUpdateClaimStatus = (id, newStatus, note) => {
    updateWarrantyClaimStatus(id, newStatus, activeStaff, note);
    addToast(`Claim ${id} status updated to ${newStatus}`, 'success');
  };

  const handleRecordHandover = (handover) => {
    const res = saveHandoverRecord(handover);
    addToast(`Handover ${handover.id} successfully recorded! Order marked completed.`, 'success');
    return res;
  };

  const handleUpdateSettings = (newSettings) => {
    saveSettings(newSettings);
    addToast('Shop settings updated successfully', 'success');
  };

  const handleResetData = () => {
    resetAllDataToDefault();
    addToast('Data reset to original demonstration sample data', 'info');
  };

  const login = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('dukkan_auth_user', JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
    if (userData.name) {
      setActiveStaff(userData.name);
    }
    addToast(`Signed in as ${userData.name}!`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('dukkan_auth_user');
    } catch (e) {
      console.error(e);
    }
    addToast('Signed out of session', 'info');
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    repairOrders,
    salesRecords,
    warrantyClaims,
    handoverRecords,
    settings,
    activeStaff,
    setActiveStaff,
    stats,
    toasts,
    addToast,
    removeToast,
    saveRepairOrder: handleSaveRepairOrder,
    updateRepairStatus: handleUpdateRepairStatus,
    deleteRepairOrder: handleDeleteRepairOrder,
    saveSale: handleSaveSale,
    saveClaim: handleSaveClaim,
    updateClaimStatus: handleUpdateClaimStatus,
    recordHandover: handleRecordHandover,
    updateSettings: handleUpdateSettings,
    resetData: handleResetData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
