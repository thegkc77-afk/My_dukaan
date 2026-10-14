/**
 * Calculates warranty expiry date based on purchase date and duration string
 */
export const calculateWarrantyExpiry = (purchaseDateStr, durationStr) => {
  if (!purchaseDateStr || !durationStr || durationStr === 'None') return null;

  const date = new Date(purchaseDateStr);
  if (isNaN(date.getTime())) return null;

  const duration = durationStr.toLowerCase();

  if (duration.includes('3 month')) {
    date.setMonth(date.getMonth() + 3);
  } else if (duration.includes('6 month')) {
    date.setMonth(date.getMonth() + 6);
  } else if (duration.includes('1 year')) {
    date.setFullYear(date.getFullYear() + 1);
  } else if (duration.includes('2 year')) {
    date.setFullYear(date.getFullYear() + 2);
  } else {
    // Default 6 months if unrecognized
    date.setMonth(date.getMonth() + 6);
  }

  return date.toISOString().split('T')[0];
};

/**
 * Evaluates warranty status against current date
 */
export const getWarrantyStatus = (expiryDateStr) => {
  if (!expiryDateStr) {
    return {
      status: 'No Warranty',
      isActive: false,
      daysRemaining: 0
    };
  }

  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) {
    return {
      status: 'Invalid Expiry Date',
      isActive: false,
      daysRemaining: 0
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining > 0) {
    return {
      status: 'Active',
      isActive: true,
      daysRemaining
    };
  } else {
    return {
      status: 'Expired',
      isActive: false,
      daysRemaining: 0,
      daysExpired: Math.abs(daysRemaining)
    };
  }
};
