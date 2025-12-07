import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';
import { Subject } from './types';

const DEFAULT_LOCAL_API = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_LOCAL_API;
// const API_URL = "http://192.168.1.14:8000";

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
  const normalize = (data: any) => {
    if (Array.isArray(data)) return data;
    const candidates = [data?.assessments, data?.items, data?.data, data?.results];
    for (const c of candidates) {
      if (Array.isArray(c)) return c;
    }
    if (Array.isArray(data?.questions)) return [data];
    return [];
  };

  const endpoints = [
    '/assessments/',
    '/assessments/diagnostic',
    '/assessments/diagnostic/',
    '/assessments/diagnostic/questions',
    '/api/assessments/diagnostic',
  ];

  for (const ep of endpoints) {
    try {
      const r = await api.get(ep);
      const norm = normalize(r.data);
      if (norm.length) return norm;
    } catch {}
  }

  try {
    const r = await api.get('/assessments/');
    return normalize(r.data);
  } catch {
    return [];
  }
};

export const getCurrentUserProfile = async () => {
  const token = await storage.getItem(TOKEN_KEY);
  if (!token) throw new Error('unauthenticated');
  const r1 = await api.get('/profiles/me');
  return r1.data;
};

export const setDiagnosticStatus = async (taken: boolean) => {
  try {
    await api.post('/users', { taken });
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
    const profile = await getCurrentUserProfile();
    const userId = String(
      profile?.id ?? profile?.user_id ?? profile?.data?.id ?? profile?.data?.user_id ?? ''
    );
    if (userId) {
      const analyticsRes = await getStudentReportAnalytics(userId);
      const analytics = analyticsRes?.data ?? analyticsRes ?? {};
      const perf = Array.isArray(analytics.subject_performance) ? analytics.subject_performance : [];
      const subjectScores = perf.map((sp: any) => {
        const sid = String(sp.subject_id ?? sp.subjectId ?? sp.subject ?? '');
        const avg = Number(sp.average_score ?? sp.score ?? 0);
        return { subject: sid, correct: isNaN(avg) ? 0 : avg, total: 100 };
      });
      const sorted = subjectScores.slice().sort((a: any, b: any) => (a.correct / a.total) - (b.correct / b.total));
      const recommendedSubjects = sorted.slice(0, 2).map((s: any) => s.subject);
      return { recommendedSubjects, subjectScores, source: 'analytics' };
    }
  } catch {}

  try {
    const token = await storage.getItem(TOKEN_KEY);
    if (!token) return {};
    const profile = await getCurrentUserProfile();
    const key = profile?.id ? `diagnostic_assessment_results:${profile.id}` : 'diagnostic_assessment_results';
    const raw = await storage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return {};
  }
};

export const getStudentReportAnalytics = async (userId: string) => {
  const r = await api.get(`/analytics/student_report/${userId}`);
  return r.data;
};

export const listSubjects = async () => {
  const r = await api.get('/subjects/');
  const data = r.data;
  if (Array.isArray(data)) return data;
  return data?.subjects ?? data?.items ?? [];
};

export const listModulesBySubject = async (subjectId: string) => {
  const r = await api.get('/modules/', { params: { subject_id: subjectId } });
  const data = r.data;
  if (Array.isArray(data)) return data;
  return data?.modules ?? data?.items ?? [];
};

export const getModuleById = async (moduleId: string) => {
  const r = await api.get(`/modules/${moduleId}`);
  return r.data;
};
