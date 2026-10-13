// Date utilities for formatting and warranty expiry calculations

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const getTodayDateInputString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Calculates warranty expiry date based on purchase date and warranty duration string
 * @param {string} purchaseDate - e.g. "2026-05-10"
 * @param {string} durationStr - e.g. "3 Months", "6 Months", "1 Year", "2 Years", "None"
 * @returns {string} ISO Date string YYYY-MM-DD
 */
export const calculateWarrantyExpiry = (purchaseDate, durationStr) => {
  if (!purchaseDate || !durationStr || durationStr === 'None' || durationStr === 'No Warranty') {
    return '';
  }

  const date = new Date(purchaseDate);
  if (isNaN(date.getTime())) return '';

  const lower = durationStr.toLowerCase();
  if (lower.includes('month')) {
    const months = parseInt(durationStr, 10) || 6;
    date.setMonth(date.getMonth() + months);
  } else if (lower.includes('year')) {
    const years = parseInt(durationStr, 10) || 1;
    date.setFullYear(date.getFullYear() + years);
  } else if (lower.includes('day')) {
    const days = parseInt(durationStr, 10) || 30;
    date.setDate(date.getDate() + days);
  } else {
    // Default 6 months
    date.setMonth(date.getMonth() + 6);
  }

  return date.toISOString().split('T')[0];
};

/**
 * Check warranty status & calculate remaining/expired days
 * @param {string} expiryDate - e.g. "2026-11-10"
 * @returns {{ isActive: boolean, daysRemaining: number, text: string }}
 */
export const getWarrantyStatus = (expiryDate) => {
  if (!expiryDate) {
    return { isActive: false, daysRemaining: 0, text: 'No Warranty' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  if (isNaN(expiry.getTime())) {
    return { isActive: false, daysRemaining: 0, text: 'Invalid Expiry' };
  }

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 0) {
    return {
      isActive: true,
      daysRemaining: diffDays,
      text: diffDays === 0 ? 'Expires today' : `${diffDays} days left`
    };
  } else {
    const overdue = Math.abs(diffDays);
    return {
      isActive: false,
      daysRemaining: diffDays,
      text: `Expired ${overdue} day${overdue > 1 ? 's' : ''} ago`
    };
  }
};
