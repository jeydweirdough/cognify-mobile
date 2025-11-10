import axios from 'axios';
import { storage } from './storage';

// IMPORTANT: Replace with your actual backend URL
// Local development: Use your computer's IP address (not localhost)
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
// --- ⚠️ CRITICAL FIX: Change this URL ---
const API_URL = 'http://localhost:8000';
// For example: 'http://192.168.1.100:8000'
// --- END FIX ---

const TOKEN_KEY = 'cognify_token';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout for AI generation
});

// Add auth token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await storage.deleteItem(TOKEN_KEY);
      // The auth context will handle redirect
    }
    return Promise.reject(error);
  }
);

export { api, API_URL, TOKEN_KEY };