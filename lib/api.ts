import axios from 'axios';
import { storage } from './storage';
import { Subject } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'cognify_token';
const REFRESH_TOKEN_KEY = 'cognify_refresh_token';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Client-Type': 'mobile',  // 🔥 NEW: Tells backend this is a mobile client
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Request interceptor - Add auth token
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

// Response interceptor - Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // 🔥 CHANGED: Send refresh_token in body (not as cookie)
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Client-Type': 'mobile' } }
        );

        // 🔥 CHANGED: Backend now returns tokens in response body for mobile
        await storage.setItem(TOKEN_KEY, data.token);
        await storage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        onRefreshed(data.token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        await storage.deleteItem(TOKEN_KEY);
        await storage.deleteItem(REFRESH_TOKEN_KEY);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface SubjectCreatePayload {
  title: string;
  description?: string;
}

export const createSubject = async (data: SubjectCreatePayload) => {
  const response = await api.post('/subjects/', data);
  return response.data;
};

export const getSubjectTopics = async (subjectId: string) => {
  const response = await api.get(`/subjects/${subjectId}`);
  return response.data as Subject;
};

export { api, API_URL, REFRESH_TOKEN_KEY, TOKEN_KEY };
export const getDiagnosticAssessmentQuestions = async () => {
  const response = await api.get('/assessments/');
  return response.data?.items ?? [];
};

export const getCurrentUserProfile = async () => {
  const token = await storage.getItem(TOKEN_KEY);
  if (!token) throw new Error('unauthenticated');
  const r1 = await api.get('/profiles/me');
  return r1.data;
};

export const setDiagnosticStatus = async (taken: boolean) => {
  try {
    await api.post('/users/me/diagnostic-status', { taken });
  } catch (e) {
    return;
  }
};

export const hasTakenDiagnostic = async (): Promise<boolean> => {
  const token = await storage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const me = await getCurrentUserProfile();
    return Boolean(
      me?.has_taken_diagnostic ??
      me?.diagnostic_taken ??
      me?.diagnostic_completed ??
      me?.is_diagnostic_done ??
      me?.meta?.diagnostic_taken
    );
  } catch {
    return false;
  }
};

export interface DiagnosticSubmissionPayload {
  user_id?: string;
  assessment_id?: string;
  subject_id?: string;
  answers: Array<{ question_id: string | number; answer: string | number | null; is_correct: boolean; competency_id?: string }>;
  score: number;
  total_items: number;
  time_taken_seconds: number;
}

export const submitDiagnosticSubmission = async (payload: DiagnosticSubmissionPayload) => {
  try {
    const r1 = await api.post('/assessments/submissions', payload);
    return r1.data;
  } catch {}
  try {
    const r2 = await api.post('/assessments/diagnostic/submit', payload);
    return r2.data;
  } catch {}
  try {
    const r3 = await api.post('/users/me/diagnostic-submission', payload);
    return r3.data;
  } catch {}
  try {
    const r4 = await api.post('/profiles/me/diagnostic-submission', payload);
    return r4.data;
  } catch {}
  const r5 = await api.post('/api/users/me/diagnostic-submission', payload);
  return r5.data;
};

export const getDiagnosticRecommendations = async () => {
  try {
    const r1 = await api.get('/users/me/diagnostic-recommendations');
    return r1.data;
  } catch {}
  try {
    const r2 = await api.get('/profiles/me/diagnostic-recommendations');
    return r2.data;
  } catch {}
  try {
    const r3 = await api.get('/assessments/recommendations/me');
    return r3.data;
  } catch {}
  const r4 = await api.get('/api/users/me/diagnostic-recommendations');
  return r4.data;
};

export const getStudentReportAnalytics = async (userId: string) => {
  const r = await api.get(`/analytics/student_report/${userId}`);
  return r.data;
};

export const listSubjects = async () => {
  const r = await api.get('/subjects/');
  return r.data?.items ?? r.data ?? [];
};
