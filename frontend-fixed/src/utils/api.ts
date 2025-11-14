import axios from 'axios';

// Configure your backend URL here
// You can directly set your backend URL here or use environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints organized by domain
export const api = {
  // Authentication
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/auth/login', { email, password }),
    register: (data: any) =>
      apiClient.post('/auth/register', data),
    me: () =>
      apiClient.get('/auth/me'),
    logout: () =>
      apiClient.post('/auth/logout'),
  },

  // Dashboard stats
  dashboard: {
    getStats: (days: number = 30) =>
      apiClient.get('/dashboard/stats', { params: { days } }),
    getIntegrityTimeline: (days: number = 30) =>
      apiClient.get('/dashboard/integrity-timeline', { params: { days } }),
    getRecentAnchors: (limit: number = 5) =>
      apiClient.get('/dashboard/recent-anchors', { params: { limit } }),
    // New admin endpoints
    getFarmers: () =>
      apiClient.get('/dashboard/farmers'),
    getFarmerDetails: (farmerId: string) =>
      apiClient.get(`/dashboard/farmers/${farmerId}`),
    getAdminStats: (days: number = 30) =>
      apiClient.get('/dashboard/stats', { params: { days } }),
  },

  // Verification
  verification: {
    verifyReading: (readingId: string) =>
      apiClient.post('/verification/verify', { readingId }),
    verifyFarmerWindow: (farmerId: string, days: number = 21) =>
      apiClient.post('/verification/verify-farmer-window', { farmerId, days }),
  },

  // Merkle Tree
  merkle: {
    getTree: (date?: string) =>
      apiClient.get('/merkle/tree', { params: { date } }),
    getNodeDetails: (nodeId: string) =>
      apiClient.get(`/merkle/node/${nodeId}`),
  },

  // Witness Network
  witnesses: {
    getAll: () =>
      apiClient.get('/witnesses'),
    getDetails: (witnessId: string) =>
      apiClient.get(`/witnesses/${witnessId}`),
    getSignatures: (limit: number = 10) =>
      apiClient.get('/witnesses/signatures/recent', { params: { limit } }),
  },

  // Live Data Feed
  readings: {
    getLive: (limit: number = 15) =>
      apiClient.get('/readings/live', { params: { limit } }),
    getStats: () =>
      apiClient.get('/readings/stats'),
    getSensorDistribution: () =>
      apiClient.get('/readings/sensor-distribution'),
  },

  // Analytics
  analytics: {
    getMonthlyData: () =>
      apiClient.get('/analytics/monthly'),
    getStorageData: () =>
      apiClient.get('/analytics/storage'),
    getRegionalData: () =>
      apiClient.get('/analytics/regional'),
    getPerformanceData: () =>
      apiClient.get('/analytics/performance'),
    getVerificationStats: () =>
      apiClient.get('/analytics/verification-stats'),
  },

  // Device Management
  devices: {
    list: () =>
      apiClient.get('/devices'),
    create: (data: any) =>
      apiClient.post('/devices', data),
    delete: (deviceId: string) =>
      apiClient.delete(`/devices/${deviceId}`),
  },
};

export default apiClient;