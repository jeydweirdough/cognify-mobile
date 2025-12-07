import axios from 'axios';
import { storage } from './storage';
import { Subject } from './types';

const DEFAULT_LOCAL_API = 'http://192.168.1.14:8000';
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
  try {
    const profile = await getCurrentUserProfile();
    const si = (profile?.student_info ?? profile?.data?.student_info) || {};
    const reports = Array.isArray(si?.progress_report)
      ? si.progress_report
      : Array.isArray(profile?.progress_report)
        ? profile.progress_report
        : [];
    const subject_performance = (reports || []).map((pr: any) => ({
      subject_id: String(pr.subject_id ?? pr.subjectId ?? ''),
      average_score: Number(pr.overall_completeness ?? pr.completeness ?? pr.percentage ?? 0) || 0,
    }));
    return { data: { subject_performance, progress_report: reports } };
  } catch {
    try {
      const r = await api.get(`/analytics/student_report/${userId}`);
      return r.data;
    } catch {
      return {};
    }
  }
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

export const listAssessmentsByModule = async (moduleId: string) => {
  const r = await api.get('/assessments/');
  const data = Array.isArray(r.data) ? r.data : (r.data?.items ?? []);
  return (data || []).filter((a: any) => String(a?.module_id ?? '') === String(moduleId) && !!a?.is_verified);
};

export const getAssessmentById = async (assessmentId: string) => {
  const r = await api.get(`/assessments/${assessmentId}`);
  return r.data;
};

export interface AssessmentSubmissionPayload {
  user_id?: string;
  assessment_id?: string;
  module_id?: string;
  subject_id?: string;
  answers: Array<{ question_id: string | number; answer: string | number | null; is_correct: boolean; }>;
  score: number;
  total_items: number;
}

export const submitAssessmentSubmission = async (payload: AssessmentSubmissionPayload) => {
  // Try multiple endpoints to maximize compatibility across backend variants
  const endpoints = [
    '/assessments/submit',
    '/assessments/submissions',
    '/assessments/diagnostic/submit',
    '/users/me/assessment-submission',
    '/profiles/me/assessment-submission',
    '/api/users/me/assessment-submission',
  ];
  for (const ep of endpoints) {
    try {
      const r = await api.post(ep, payload);
      return r.data;
    } catch {}
  }
  throw new Error('Unable to submit assessment');
};

export const markAssessmentTaken = async (assessmentId: string) => {
  const key = `assessment_taken:${assessmentId}`;
  try {
    await storage.setItem(key, '1');
  } catch {}
  try {
    const a = await getAssessmentById(assessmentId);
    const subjectId = String(a?.subject_id ?? '');
    if (subjectId) {
      await updateAssessmentProgress(subjectId, 100);
    }
  } catch {}
};

export const hasTakenAssessment = async (assessmentId: string): Promise<boolean> => {
  const key = `assessment_taken:${assessmentId}`;
  const local = await storage.getItem(key);
  if (local) return true;
  const endpoints = [
    `/assessments/submissions?assessment_id=${assessmentId}`,
    '/profiles/me/assessment-submissions',
    '/users/me/assessment-submissions',
  ];
  for (const ep of endpoints) {
    try {
      const r = await api.get(ep);
      const data = Array.isArray(r.data) ? r.data : (r.data?.items ?? r.data?.submissions ?? []);
      const found = (data || []).some((it: any) => String(it.assessment_id ?? it.id ?? '') === String(assessmentId));
      if (found) return true;
    } catch {}
  }
  return false;
};
export const updateModuleProgress = async (
  moduleId: string,
  subjectId?: string,
  percentage?: number,
  status?: 'in_progress' | 'completed',
  timesTaken?: number,
  timeSpentSeconds?: number,
) => {
  const key = `module_progress:${moduleId}`;
  
  // Store progress locally
  try {
    await storage.setItem(key, JSON.stringify({ 
      percentage: percentage ?? 0, 
      subject_id: subjectId ?? '',
      status: status || (typeof percentage === 'number' && percentage >= 100 ? 'completed' : 'in_progress'),
      times_taken: timesTaken,
      time_spent: timeSpentSeconds,
      updated_at: new Date().toISOString()
    }));
    
    // Also update subject-level progress if available
    if (subjectId) {
      const sKey = `subject_module_progress:${subjectId}`;
      const prev = await storage.getItem(sKey);
      const prevPct = prev ? Number(JSON.parse(prev)?.percentage ?? 0) || 0 : 0;
      const nextPct = Math.max(prevPct, Number(percentage ?? 0));
      await storage.setItem(sKey, JSON.stringify({ 
        percentage: nextPct,
        updated_at: new Date().toISOString()
      }));
    }
  } catch (err) {
    console.warn('Failed to store module progress locally:', err);
  }

  if (subjectId) {
    try {
      const sid = String(subjectId);
      const ms = await listModulesBySubject(sid);
      const total = Array.isArray(ms) ? ms.length : 0;
      let done = 0;
      for (const m of ms) {
        const mk = `module_progress:${String(m.id)}`;
        const rv = await storage.getItem(mk);
        const pct = rv ? Number(JSON.parse(rv)?.percentage ?? 0) || 0 : 0;
        if (pct >= 100) done += 1;
      }
      const aggregated = total > 0 ? Math.round((done / total) * 100) : Math.round(Number(percentage ?? 0) || 0);

      const profile = await getCurrentUserProfile();
      const si = (profile?.student_info ?? profile?.data?.student_info) || {};
      const reports = Array.isArray(si?.progress_report)
        ? si.progress_report
        : Array.isArray(profile?.progress_report)
          ? profile.progress_report
          : [];
      const idx = (reports || []).findIndex((r: any) => String(r.subject_id ?? r.subjectId ?? '') === sid);
      const existing = idx >= 0 ? reports[idx] : { subject_id: sid, modules_completeness: 0, assessment_completeness: 0, overall_completeness: 0, weakest_competencies: [] };
      const nextModules = aggregated;
      const nextAssess = Number(existing.assessment_completeness ?? 0) || 0;
      const overall = Math.round((nextModules + nextAssess) / 2);
      const next = { ...existing, subject_id: sid, modules_completeness: nextModules, assessment_completeness: nextAssess, overall_completeness: overall };
      const nextReports = idx >= 0 ? Object.assign([], reports, { [idx]: next }) : [...reports, next];
      await api.put('/profiles/me', { student_info: { ...si, progress_report: nextReports } });
    } catch (err) {
      console.warn('Failed to update aggregated subject modules completeness:', err);
    }
  }
};

export const updateAssessmentProgress = async (subjectId?: string, percentage?: number) => {
  const key = subjectId ? `subject_assessment_progress:${subjectId}` : '';
  
  // Store progress locally
  try {
    if (subjectId) {
      await storage.setItem(key, JSON.stringify({ 
        percentage: percentage ?? 0,
        updated_at: new Date().toISOString()
      }));
    }
  } catch (err) {
    console.warn('Failed to store assessment progress locally:', err);
  }

  if (subjectId && percentage !== undefined) {
    try {
      const sid = String(subjectId);
      const profile = await getCurrentUserProfile();
      const si = (profile?.student_info ?? profile?.data?.student_info) || {};
      const reports = Array.isArray(si?.progress_report)
        ? si.progress_report
        : Array.isArray(profile?.progress_report)
          ? profile.progress_report
          : [];
      const idx = (reports || []).findIndex((r: any) => String(r.subject_id ?? r.subjectId ?? '') === sid);
      const existing = idx >= 0 ? reports[idx] : { subject_id: sid, modules_completeness: 0, assessment_completeness: 0, overall_completeness: 0, weakest_competencies: [] };
      const nextAssess = Number(percentage ?? existing.assessment_completeness ?? 0) || 0;
      const nextModules = Number(existing.modules_completeness ?? 0) || 0;
      const overall = Math.round((nextModules + nextAssess) / 2);
      const next = { ...existing, subject_id: sid, modules_completeness: nextModules, assessment_completeness: nextAssess, overall_completeness: overall };
      const nextReports = idx >= 0 ? Object.assign([], reports, { [idx]: next }) : [...reports, next];
      await api.put('/profiles/me', { student_info: { ...si, progress_report: nextReports } });
    } catch (err) {
      console.warn('Failed to update subject assessment completeness:', err);
    }
  }
};

// Helper function to get module progress
export const getModuleProgress = async (moduleId: string) => {
  const key = `module_progress:${moduleId}`;
  try {
    const raw = await storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Helper function to get subject progress
export const getSubjectProgress = async (subjectId: string) => {
  try {
    const moduleKey = `subject_module_progress:${subjectId}`;
    const assessmentKey = `subject_assessment_progress:${subjectId}`;
    
    const [moduleRaw, assessmentRaw] = await Promise.all([
      storage.getItem(moduleKey),
      storage.getItem(assessmentKey)
    ]);
    
    const moduleProgress = moduleRaw ? JSON.parse(moduleRaw) : { percentage: 0 };
    const assessmentProgress = assessmentRaw ? JSON.parse(assessmentRaw) : { percentage: 0 };
    
    const overall = Math.round((moduleProgress.percentage + assessmentProgress.percentage) / 2);
    
    return {
      module_percentage: moduleProgress.percentage,
      assessment_percentage: assessmentProgress.percentage,
      overall_percentage: overall
    };
  } catch {
    return {
      module_percentage: 0,
      assessment_percentage: 0,
      overall_percentage: 0
    };
  }
};
