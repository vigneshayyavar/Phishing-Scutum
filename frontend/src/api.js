import axios from 'axios';

export const api = axios.create({
  baseURL:
  import.meta.env.VITE_API_URL ||
  'https://phishing-scutum.onrender.com/api',
  timeout: 65000,
});

// Attach the authentication token to API requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('Phishing Scutum_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Analyze a single job offer, email, or URL
export async function analyze(payload) {
  const response = await api.post('/analyze', payload);
  return response.data;
}

// Analyze multiple items in a batch
export async function batchAnalyze(payload) {
  const timeout = Math.max(
    65000,
    (payload?.targetMs || 0) + 5000
  );

  const response = await api.post('/analyze/batch', payload, {
    timeout,
  });

  return response.data;
}