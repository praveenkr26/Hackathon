import axios from 'axios';

// Use Vite proxy in dev, direct URL in production
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ─── Request Interceptor ─────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// ─── Scheme API ──────────────────────────────────────────────
export const schemeAPI = {
  getAll: (params = {}) => api.get('/schemes', { params }),
  getById: (id) => api.get(`/schemes/${id}`),
  getStats: () => api.get('/schemes/stats'),
  getCategories: () => api.get('/schemes/categories'),
  getByCategory: (category) => api.get(`/schemes/category/${category}`),
  match: (profile) => api.post('/schemes/match', profile)
};

// ─── AI API ──────────────────────────────────────────────────
export const aiAPI = {
  classifyIntent: (message) => api.post('/ai/intent', { message }),
  extractProfile: (text) => api.post('/ai/profile', { text }),
  processOCR: (data) => api.post('/ai/ocr', data),
  chat: (data) => api.post('/ai/chat', data),
  getChatHistory: () => api.get('/ai/chat/history'),
  getChatSession: (sessionId) => api.get(`/ai/chat/${sessionId}`),
  deleteChatSession: (sessionId) => api.delete(`/ai/chat/${sessionId}`),
  clearChatHistory: () => api.delete('/ai/chat/history/all')
};

// ─── Health ──────────────────────────────────────────────────
export const healthAPI = {
  check: () => api.get('/health')
};

export default api;
