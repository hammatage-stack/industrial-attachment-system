import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://backend.industrial-attachment.svc.cluster.local:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTHENTICATION ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  changePassword: (data) => api.put('/auth/change-password', data),
  requestPasswordReset: (email) => api.post('/auth/password-reset', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword })
};

// ============ INSTITUTIONS ============
export const institutionAPI = {
  getAll: (params) => api.get('/institutions', { params }),
  getById: (id) => api.get(`/institutions/${id}`),
  getTypes: () => api.get('/institutions/types/list'),
  getCounties: () => api.get('/institutions/counties'),
  getSubCounties: (county) => api.get(`/institutions/sub-counties/${county}`),
  create: (data) => api.post('/institutions', data),
  update: (id, data) => api.put(`/institutions/${id}`, data),
  verify: (id) => api.put(`/institutions/${id}/verify`),
  delete: (id) => api.delete(`/institutions/${id}`)
};

// ============ OPPORTUNITIES ============
export const opportunityAPI = {
  getAll: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  updateStatus: (id, status) => api.put(`/opportunities/${id}/status`, { status }),
  delete: (id) => api.delete(`/opportunities/${id}`),
  save: (id) => api.post(`/opportunities/${id}/save`),
  unsave: (id) => api.delete(`/opportunities/${id}/save`),
  getSaved: () => api.get('/opportunities/saved/list')
};

// Company-specific opportunity endpoints
export const companyAPI = {
  getMyOpportunities: () => api.get('/opportunities/company/mine'),
  getApplicationsForOpportunity: (id) => api.get(`/opportunities/${id}/applications`)
};

// ============ APPLICATIONS ============
export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getMyApplications: (params) => api.get('/applications/my', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  update: (id, data) => api.put(`/applications/${id}`, data),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  getAll: (params) => api.get('/applications', { params })
};

// ============ NOTIFICATIONS ==========
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`)
};

// ============ PAYMENTS ============
export const paymentAPI = {
  validateMpesa: (data) => api.post('/payments/validate-mpesa', data),
  getStatus: (applicationId) => api.get(`/payments/${applicationId}/status`),
  getAll: (params) => api.get('/payments', { params }),
  verify: (paymentId, data) => api.put(`/payments/${paymentId}/verify`, data),
  reject: (paymentId, data) => api.put(`/payments/${paymentId}/reject`, data),
  flagDuplicate: (paymentId) => api.put(`/payments/${paymentId}/flag-duplicate`)
};

// ============ UPLOADS ============
export const uploadAPI = {
  uploadFile: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// ============ ADMIN ============
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getOpportunityDetail: (id) => api.get(`/admin/opportunities/${id}`),
  getApplicationFull: (id) => api.get(`/admin/applications/${id}/full`),
  getSystemLogs: (params) => api.get('/admin/logs', { params }),
  generateReport: (type, params) => api.get(`/admin/reports/${type}`, { params }),
  // Payment Verification
  getPendingPayments: () => api.get('/admin/payments/pending'),
  getPaymentStats: () => api.get('/admin/payments/stats'),
  verifyPayment: (applicationId, data) => api.post(`/admin/payments/${applicationId}/verify`, data),
  rejectPayment: (applicationId, data) => api.post(`/admin/payments/${applicationId}/reject`, data)
};

export default api;
