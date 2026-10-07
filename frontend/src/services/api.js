import axios from 'axios';

// In production, requests use same-origin relative '/api' paths.
// In development, Vite server proxies '/api' to 'http://localhost:8000'.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchMetadata = async () => {
  const res = await api.get('/model-info');
  return res.data;
};

export const predictPrice = async (features) => {
  const res = await api.post('/predict', { features });
  return res.data;
};

export const fetchHistory = async (limit = 50, offset = 0, brand = null) => {
  const params = { limit, offset };
  if (brand) params.brand = brand;
  const res = await api.get('/history', { params });
  return res.data;
};

export const fetchHistoryStats = async () => {
  const res = await api.get('/history/stats');
  return res.data;
};

export const deleteHistoryItem = async (id) => {
  const res = await api.delete(`/history/${id}`);
  return res.data;
};

export const clearAllHistory = async () => {
  const res = await api.delete('/history');
  return res.data;
};

export const fetchDatasets = async () => {
  const res = await api.get('/training/datasets');
  return res.data;
};

export const analyzeDataset = async (filename = null) => {
  const params = filename ? { filename } : {};
  const res = await api.get('/training/analyze', { params });
  return res.data;
};

export const trainModel = async (filename = null) => {
  const params = filename ? { filename } : {};
  const res = await api.post('/training/train', null, { params });
  return res.data;
};

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/training/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export default api;
