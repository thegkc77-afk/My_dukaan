// Authoritative API service layer connecting the frontend to the My Dukaan Express backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'dukkan_auth_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to update auth token', err);
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

/**
 * Standard HTTP request wrapper with automatic Bearer token and JSON handling
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  // Don't set Content-Type if FormData is used (e.g. file upload)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // If token expired, clear token
    clearToken();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error?.message || data.message || `API error (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data.error?.code || 'API_ERROR';
    error.details = data.error?.details || [];
    throw error;
  }

  return data;
};

// ======================== API ENDPOINTS ========================

export const authAPI = {
  login: async ({ email, password, shopName }) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, shopName })
    });
    if (res.data?.token) {
      setToken(res.data.token);
    }
    return res.data;
  },
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {}
    clearToken();
  },
  getMe: async () => {
    const res = await request('/auth/me');
    return res.data;
  }
};

export const dashboardAPI = {
  getSummary: async () => {
    const res = await request('/dashboard/summary');
    return res.data;
  },
  getRecentRepairs: async (limit = 10) => {
    const res = await request(`/dashboard/recent-repairs?limit=${limit}`);
    return res.data;
  },
  getRecentClaims: async (limit = 10) => {
    const res = await request(`/dashboard/recent-claims?limit=${limit}`);
    return res.data;
  }
};

export const repairsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/repairs${query ? `?${query}` : ''}`);
    return res.data?.items || [];
  },
  getById: async (id) => {
    const res = await request(`/repairs/${id}`);
    return res.data;
  },
  create: async (orderData) => {
    const res = await request('/repairs', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return res.data;
  },
  update: async (id, updates) => {
    const res = await request(`/repairs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.data;
  },
  updateStatus: async (id, status, note = '') => {
    const res = await request(`/repairs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await request(`/repairs/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

export const itemsAPI = {
  search: async (query = '', filters = {}) => {
    const params = new URLSearchParams({
      q: query,
      ...(filters.category && filters.category !== 'All' ? { category: filters.category } : {}),
      ...(filters.brand && filters.brand !== 'All' ? { brand: filters.brand } : {}),
      ...(filters.status && filters.status !== 'All' ? { status: filters.status } : {})
    });
    const res = await request(`/items/search?${params.toString()}`);
    return res.data || [];
  },
  getById: async (id) => {
    const res = await request(`/items/${id}`);
    return res.data;
  }
};

export const salesAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/sales${query ? `?${query}` : ''}`);
    return res.data?.items || [];
  },
  getById: async (id) => {
    const res = await request(`/sales/${id}`);
    return res.data;
  },
  create: async (saleData) => {
    const res = await request('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData)
    });
    return res.data;
  },
  update: async (id, updates) => {
    const res = await request(`/sales/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.data;
  }
};

export const warrantyAPI = {
  lookup: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/warranty/lookup${query ? `?${query}` : ''}`);
    return res.data || [];
  },
  getSaleWarranty: async (id) => {
    const res = await request(`/sales/${id}/warranty`);
    return res.data;
  }
};

export const claimsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/warranty-claims${query ? `?${query}` : ''}`);
    return res.data?.items || [];
  },
  getById: async (id) => {
    const res = await request(`/warranty-claims/${id}`);
    return res.data;
  },
  create: async (claimData) => {
    const res = await request('/warranty-claims', {
      method: 'POST',
      body: JSON.stringify(claimData)
    });
    return res.data;
  },
  updateStatus: async (id, status, staff, note = '') => {
    const res = await request(`/warranty-claims/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, staff, note })
    });
    return res.data;
  }
};

export const handoversAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/handovers${query ? `?${query}` : ''}`);
    return res.data?.items || [];
  },
  getById: async (id) => {
    const res = await request(`/handovers/${id}`);
    return res.data;
  },
  create: async (handoverData) => {
    const res = await request('/handovers', {
      method: 'POST',
      body: JSON.stringify(handoverData)
    });
    return res.data;
  }
};

export const settingsAPI = {
  get: async () => {
    const res = await request('/settings');
    return res.data;
  },
  update: async (settingsData) => {
    const res = await request('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settingsData)
    });
    return res.data;
  },
  listStaff: async () => {
    const res = await request('/settings/staff');
    return res.data;
  },
  createStaff: async (staffData) => {
    const res = await request('/settings/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
    return res.data;
  },
  exportBackup: async () => {
    const res = await request('/settings/backup/export');
    return res.data;
  },
  importBackup: async (backupData) => {
    const res = await request('/settings/backup/import', {
      method: 'POST',
      body: JSON.stringify(backupData)
    });
    return res.data;
  }
};

export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await request('/uploads/images', {
      method: 'POST',
      body: formData
    });
    return res.data;
  }
};
