// LocalStorage persistence layer with fallback and reactive subscribers
import {
  INITIAL_REPAIR_ORDERS,
  INITIAL_SALES_RECORDS,
  INITIAL_WARRANTY_CLAIMS,
  INITIAL_HANDOVERS,
  DEFAULT_SETTINGS
} from '../data/mockData';

const STORAGE_KEYS = {
  REPAIR_ORDERS: 'dukkan_repair_orders_v1',
  SALES_RECORDS: 'dukkan_sales_records_v1',
  WARRANTY_CLAIMS: 'dukkan_warranty_claims_v1',
  HANDOVER_RECORDS: 'dukkan_handover_records_v1',
  SETTINGS: 'dukkan_settings_v1'
};

// Listeners to broadcast storage changes
const listeners = new Set();
export const subscribeToDataChanges = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifySubscribers = () => {
  listeners.forEach((cb) => {
    try { cb(); } catch (err) { console.error('Storage notify error', err); }
  });
};

// Safe JSON reading
const getParsedItem = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
};

// Initialize seed data if not present
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.REPAIR_ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.REPAIR_ORDERS, JSON.stringify(INITIAL_REPAIR_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SALES_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.SALES_RECORDS, JSON.stringify(INITIAL_SALES_RECORDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WARRANTY_CLAIMS)) {
    localStorage.setItem(STORAGE_KEYS.WARRANTY_CLAIMS, JSON.stringify(INITIAL_WARRANTY_CLAIMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HANDOVER_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.HANDOVER_RECORDS, JSON.stringify(INITIAL_HANDOVERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
};

// --- Repair Orders ---
export const getRepairOrders = () => getParsedItem(STORAGE_KEYS.REPAIR_ORDERS, INITIAL_REPAIR_ORDERS);

export const getRepairOrderById = (id) => {
  const orders = getRepairOrders();
  return orders.find((o) => o.id === id) || null;
};

export const saveRepairOrder = (order) => {
  const orders = getRepairOrders();
  const existingIdx = orders.findIndex((o) => o.id === order.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...orders];
    updated[existingIdx] = { ...updated[existingIdx], ...order };
  } else {
    updated = [order, ...orders];
  }
  setItem(STORAGE_KEYS.REPAIR_ORDERS, updated);
  return order;
};

export const updateRepairOrderStatus = (id, newStatus, note = '') => {
  const orders = getRepairOrders();
  const updated = orders.map((o) => {
    if (o.id === id) {
      return {
        ...o,
        repairStatus: newStatus,
        notes: note ? `${o.notes ? o.notes + '\n' : ''}[${new Date().toLocaleDateString('en-IN')}] Status changed to ${newStatus}: ${note}` : o.notes
      };
    }
    return o;
  });
  setItem(STORAGE_KEYS.REPAIR_ORDERS, updated);
};

export const deleteRepairOrder = (id) => {
  const orders = getRepairOrders();
  const updated = orders.filter((o) => o.id !== id);
  setItem(STORAGE_KEYS.REPAIR_ORDERS, updated);
};

// --- Sales & Warranty Records ---
export const getSalesRecords = () => getParsedItem(STORAGE_KEYS.SALES_RECORDS, INITIAL_SALES_RECORDS);

export const getSalesRecordById = (id) => {
  const records = getSalesRecords();
  return records.find((r) => r.id === id) || null;
};

export const saveSalesRecord = (record) => {
  const records = getSalesRecords();
  const existingIdx = records.findIndex((r) => r.id === record.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...records];
    updated[existingIdx] = { ...updated[existingIdx], ...record };
  } else {
    updated = [record, ...records];
  }
  setItem(STORAGE_KEYS.SALES_RECORDS, updated);
  return record;
};

// --- Warranty Claims ---
export const getWarrantyClaims = () => getParsedItem(STORAGE_KEYS.WARRANTY_CLAIMS, INITIAL_WARRANTY_CLAIMS);

export const getWarrantyClaimById = (id) => {
  const claims = getWarrantyClaims();
  return claims.find((c) => c.id === id) || null;
};

export const saveWarrantyClaim = (claim) => {
  const claims = getWarrantyClaims();
  const existingIdx = claims.findIndex((c) => c.id === claim.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...claims];
    updated[existingIdx] = { ...updated[existingIdx], ...claim };
  } else {
    updated = [claim, ...claims];
  }
  setItem(STORAGE_KEYS.WARRANTY_CLAIMS, updated);
  return claim;
};

export const updateWarrantyClaimStatus = (id, newStatus, staffName, note) => {
  const claims = getWarrantyClaims();
  const updated = claims.map((c) => {
    if (c.id === id) {
      const historyEntry = {
        date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: newStatus,
        staff: staffName || 'Staff',
        note: note || `Status updated to ${newStatus}`
      };
      return {
        ...c,
        claimStatus: newStatus,
        history: [...(c.history || []), historyEntry]
      };
    }
    return c;
  });
  setItem(STORAGE_KEYS.WARRANTY_CLAIMS, updated);
};

// --- Handover Records ---
export const getHandoverRecords = () => getParsedItem(STORAGE_KEYS.HANDOVER_RECORDS, INITIAL_HANDOVERS);

export const saveHandoverRecord = (handover) => {
  const handovers = getHandoverRecords();
  const updated = [handover, ...handovers];
  setItem(STORAGE_KEYS.HANDOVER_RECORDS, updated);

  // Mark the linked repair order as Completed!
  if (handover.orderId) {
    const orders = getRepairOrders();
    const updatedOrders = orders.map((o) => {
      if (o.id === handover.orderId) {
        return {
          ...o,
          repairStatus: 'Completed',
          verificationComplete: true,
          handoverId: handover.id
        };
      }
      return o;
    });
    setItem(STORAGE_KEYS.REPAIR_ORDERS, updatedOrders);
  }

  return handover;
};

// --- Settings ---
export const getSettings = () => getParsedItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

export const saveSettings = (newSettings) => {
  setItem(STORAGE_KEYS.SETTINGS, newSettings);
};

export const resetAllDataToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.REPAIR_ORDERS, JSON.stringify(INITIAL_REPAIR_ORDERS));
  localStorage.setItem(STORAGE_KEYS.SALES_RECORDS, JSON.stringify(INITIAL_SALES_RECORDS));
  localStorage.setItem(STORAGE_KEYS.WARRANTY_CLAIMS, JSON.stringify(INITIAL_WARRANTY_CLAIMS));
  localStorage.setItem(STORAGE_KEYS.HANDOVER_RECORDS, JSON.stringify(INITIAL_HANDOVERS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  notifySubscribers();
};

// --- Backup & Restore ---
export const exportBackupJSON = () => {
  const dump = {
    exportDate: new Date().toISOString(),
    repairOrders: getRepairOrders(),
    salesRecords: getSalesRecords(),
    warrantyClaims: getWarrantyClaims(),
    handoverRecords: getHandoverRecords(),
    settings: getSettings()
  };
  return JSON.stringify(dump, null, 2);
};

export const importBackupJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.repairOrders) localStorage.setItem(STORAGE_KEYS.REPAIR_ORDERS, JSON.stringify(parsed.repairOrders));
    if (parsed.salesRecords) localStorage.setItem(STORAGE_KEYS.SALES_RECORDS, JSON.stringify(parsed.salesRecords));
    if (parsed.warrantyClaims) localStorage.setItem(STORAGE_KEYS.WARRANTY_CLAIMS, JSON.stringify(parsed.warrantyClaims));
    if (parsed.handoverRecords) localStorage.setItem(STORAGE_KEYS.HANDOVER_RECORDS, JSON.stringify(parsed.handoverRecords));
    if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
    notifySubscribers();
    return true;
  } catch (err) {
    console.error('Import backup failed:', err);
    return false;
  }
};

/**
 * Resizes and compresses an image file to lightweight DataURL
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }
    // Max 10MB raw file allowed
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('File exceeds 10MB limit'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
