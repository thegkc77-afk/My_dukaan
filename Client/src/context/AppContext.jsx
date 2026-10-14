import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authAPI,
  repairsAPI,
  salesAPI,
  claimsAPI,
  handoversAPI,
  settingsAPI,
  getToken,
  clearToken
} from '../services/api';
import {
  initializeStorage,
  getRepairOrders as getLocalRepairOrders,
  getSalesRecords as getLocalSalesRecords,
  getWarrantyClaims as getLocalWarrantyClaims,
  getHandoverRecords as getLocalHandoverRecords,
  getSettings as getLocalSettings,
  saveRepairOrder as saveLocalRepairOrder,
  updateRepairOrderStatus as updateLocalRepairOrderStatus,
  deleteRepairOrder as deleteLocalRepairOrder,
  saveSalesRecord as saveLocalSalesRecord,
  saveWarrantyClaim as saveLocalWarrantyClaim,
  updateWarrantyClaimStatus as updateLocalWarrantyClaimStatus,
  saveHandoverRecord as saveLocalHandoverRecord,
  saveSettings as saveLocalSettings,
  resetAllDataToDefault as resetLocalData
} from '../utils/storage';
import { getWarrantyStatus } from '../utils/dateUtils';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Ensure local seed fallback available
  initializeStorage();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('dukkan_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [repairOrders, setRepairOrders] = useState(getLocalRepairOrders());
  const [salesRecords, setSalesRecords] = useState(getLocalSalesRecords());
  const [warrantyClaims, setWarrantyClaims] = useState(getLocalWarrantyClaims());
  const [handoverRecords, setHandoverRecords] = useState(getLocalHandoverRecords());
  const [settings, setSettingsState] = useState(getLocalSettings());
  const [isLoading, setIsLoading] = useState(false);

  const [activeStaff, setActiveStaff] = useState(() => {
    try {
      const stored = localStorage.getItem('dukkan_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) return u.name;
      }
    } catch {}
    return getLocalSettings().staffMembers?.[0] || 'Ramesh Kumar (Owner)';
  });

  const [toasts, setToasts] = useState([]);

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

  // Fetch all central database records from backend API
  const refreshDataFromBackend = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setIsLoading(true);
      const [repairs, sales, claims, handovers, shopSettings] = await Promise.allSettled([
        repairsAPI.getAll(),
        salesAPI.getAll(),
        claimsAPI.getAll(),
        handoversAPI.getAll(),
        settingsAPI.get()
      ]);

      if (repairs.status === 'fulfilled' && Array.isArray(repairs.value)) {
        setRepairOrders(repairs.value);
      }
      if (sales.status === 'fulfilled' && Array.isArray(sales.value)) {
        setSalesRecords(sales.value);
      }
      if (claims.status === 'fulfilled' && Array.isArray(claims.value)) {
        setWarrantyClaims(claims.value);
      }
      if (handovers.status === 'fulfilled' && Array.isArray(handovers.value)) {
        setHandoverRecords(handovers.value);
      }
      if (shopSettings.status === 'fulfilled' && shopSettings.value) {
        setSettingsState(shopSettings.value);
        if (shopSettings.value.staffMembers?.length && !shopSettings.value.staffMembers.includes(activeStaff)) {
          setActiveStaff(shopSettings.value.staffMembers[0]);
        }
      }
    } catch (err) {
      console.warn('Backend sync failed, using cached records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeStaff]);

  // Sync on startup or when auth changes
  useEffect(() => {
    if (currentUser && getToken()) {
      refreshDataFromBackend();
    }
  }, [currentUser, refreshDataFromBackend]);

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

  const handleSaveRepairOrder = async (order) => {
    try {
      const saved = await repairsAPI.create(order);
      const formatted = { ...saved, id: saved.recordId || saved.id };
      setRepairOrders((prev) => [formatted, ...prev.filter((o) => o.id !== formatted.id)]);
      addToast(`Repair Order ${formatted.id} saved to central database!`, 'success');
      return formatted;
    } catch (err) {
      console.warn('API save failed, falling back to local storage:', err);
      const res = saveLocalRepairOrder(order);
      setRepairOrders((prev) => [res, ...prev.filter((o) => o.id !== res.id)]);
      addToast(`Repair Order ${order.id} saved locally`, 'info');
      return res;
    }
  };

  const handleUpdateRepairStatus = async (id, newStatus, note = '') => {
    try {
      const updated = await repairsAPI.updateStatus(id, newStatus, note);
      const formatted = { ...updated, id: updated.recordId || updated.id };
      setRepairOrders((prev) => prev.map((o) => (o.id === id ? formatted : o)));
      addToast(`Order ${id} status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.warn('API status update failed, falling back to local:', err);
      updateLocalRepairOrderStatus(id, newStatus, note);
      setRepairOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, repairStatus: newStatus } : o))
      );
      addToast(`Order ${id} status updated to ${newStatus}`, 'info');
    }
  };

  const handleDeleteRepairOrder = async (id) => {
    try {
      await repairsAPI.delete(id);
      setRepairOrders((prev) => prev.filter((o) => o.id !== id));
      addToast(`Order ${id} removed from database`, 'info');
    } catch (err) {
      console.warn('API delete failed, falling back to local:', err);
      deleteLocalRepairOrder(id);
      setRepairOrders((prev) => prev.filter((o) => o.id !== id));
      addToast(`Order ${id} deleted locally`, 'info');
    }
  };

  const handleSaveSale = async (sale) => {
    try {
      const saved = await salesAPI.create(sale);
      const formatted = { ...saved, id: saved.recordId || saved.id };
      setSalesRecords((prev) => [formatted, ...prev.filter((s) => s.id !== formatted.id)]);
      addToast(`Sales & Warranty record ${formatted.id} registered centrally!`, 'success');
      return formatted;
    } catch (err) {
      console.warn('API sale save failed, falling back to local:', err);
      const res = saveLocalSalesRecord(sale);
      setSalesRecords((prev) => [res, ...prev.filter((s) => s.id !== res.id)]);
      addToast(`Sales record ${sale.id} saved locally`, 'info');
      return res;
    }
  };

  const handleSaveClaim = async (claim) => {
    try {
      const saved = await claimsAPI.create(claim);
      const formatted = { ...saved, id: saved.recordId || saved.id };
      setWarrantyClaims((prev) => [formatted, ...prev.filter((c) => c.id !== formatted.id)]);
      addToast(`Warranty Claim ${formatted.id} logged in central database!`, 'success');
      return formatted;
    } catch (err) {
      console.warn('API claim save failed, falling back to local:', err);
      const res = saveLocalWarrantyClaim(claim);
      setWarrantyClaims((prev) => [res, ...prev.filter((c) => c.id !== res.id)]);
      addToast(`Warranty Claim ${claim.id} saved locally`, 'info');
      return res;
    }
  };

  const handleUpdateClaimStatus = async (id, newStatus, note = '') => {
    try {
      const updated = await claimsAPI.updateStatus(id, newStatus, activeStaff, note);
      const formatted = { ...updated, id: updated.recordId || updated.id };
      setWarrantyClaims((prev) => prev.map((c) => (c.id === id ? formatted : c)));
      addToast(`Claim ${id} status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.warn('API claim status update failed, falling back to local:', err);
      updateLocalWarrantyClaimStatus(id, newStatus, activeStaff, note);
      setWarrantyClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, claimStatus: newStatus } : c))
      );
      addToast(`Claim ${id} status updated to ${newStatus}`, 'info');
    }
  };

  const handleRecordHandover = async (handover) => {
    try {
      const res = await handoversAPI.create(handover);
      const savedHandover = {
        ...res.handover,
        id: res.handover.recordId || res.handover.id,
        orderId: res.handover.repairOrderId || res.handover.orderId
      };
      setHandoverRecords((prev) => [savedHandover, ...prev]);

      // Update linked order in state
      if (res.repairOrder) {
        const updatedOrder = { ...res.repairOrder, id: res.repairOrder.recordId || res.repairOrder.id };
        setRepairOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      } else {
        setRepairOrders((prev) =>
          prev.map((o) =>
            o.id === savedHandover.orderId
              ? { ...o, repairStatus: 'Completed', verificationComplete: true, handoverId: savedHandover.id }
              : o
          )
        );
      }

      addToast(`Handover ${savedHandover.id} recorded! Order marked completed.`, 'success');
      return savedHandover;
    } catch (err) {
      console.warn('API handover failed, falling back to local:', err);
      const res = saveLocalHandoverRecord(handover);
      setHandoverRecords((prev) => [res, ...prev]);
      setRepairOrders((prev) =>
        prev.map((o) =>
          o.id === handover.orderId
            ? { ...o, repairStatus: 'Completed', verificationComplete: true, handoverId: res.id }
            : o
        )
      );
      addToast(`Handover ${handover.id} recorded locally. Order completed.`, 'info');
      return res;
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const updated = await settingsAPI.update(newSettings);
      setSettingsState(updated);
      saveLocalSettings(newSettings);
      addToast('Shop settings updated centrally in database', 'success');
    } catch (err) {
      console.warn('API settings update failed, falling back to local:', err);
      saveLocalSettings(newSettings);
      setSettingsState(newSettings);
      addToast('Shop settings saved locally', 'info');
    }
  };

  const handleResetData = () => {
    resetLocalData();
    setRepairOrders(getLocalRepairOrders());
    setSalesRecords(getLocalSalesRecords());
    setWarrantyClaims(getLocalWarrantyClaims());
    setHandoverRecords(getLocalHandoverRecords());
    setSettingsState(getLocalSettings());
    addToast('Data reset to original demonstration sample data', 'info');
  };

  const login = async (credentials) => {
    try {
      // Attempt real server login
      const res = await authAPI.login({
        email: credentials.email,
        password: credentials.password || '123456',
        shopName: credentials.shopName
      });

      const userObj = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        shopId: res.user.shopId,
        shopName: res.user.shopName,
        loginTime: new Date().toISOString()
      };

      setCurrentUser(userObj);
      localStorage.setItem('dukkan_auth_user', JSON.stringify(userObj));
      if (userObj.name) {
        setActiveStaff(userObj.name);
      }

      if (res.shop) {
        setSettingsState(res.shop);
      }

      addToast(`Signed in as ${userObj.name}!`, 'success');
      refreshDataFromBackend();
      return userObj;
    } catch (err) {
      // If server is unreachable or login failed, check if it's a network issue vs invalid credentials
      if (err.status === 401 || err.code === 'INVALID_CREDENTIALS') {
        throw err;
      }
      console.warn('Server login error, using local session:', err);
      // Fallback local session if server is offline
      const fallbackUser = {
        ...credentials,
        loginTime: new Date().toISOString()
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('dukkan_auth_user', JSON.stringify(fallbackUser));
      if (fallbackUser.name) setActiveStaff(fallbackUser.name);
      addToast(`Signed in as ${fallbackUser.name} (Local mode)`, 'info');
      return fallbackUser;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    clearToken();
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
    isLoading,
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
    refreshData: refreshDataFromBackend,
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
