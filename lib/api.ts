import axios from 'axios';
// --- FIX: Import our custom storage wrapper ---
import { storage } from './storage';

// REPLACE WITH YOUR BACKEND URL
// If running backend locally: 'http://<YOUR_COMPUTER_IP>:8000'
// If deployed: 'https://your-backend-url.com'
const API_URL = 'http://localhost:8000'; 

const TOKEN_KEY = 'cognify_token';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(
  async (config) => {
    // --- FIX: Use our storage wrapper ---
    const token = await storage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api, API_URL, TOKEN_KEY };