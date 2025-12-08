import axios from 'axios';
import { storage } from './storage';
import { Subject } from './types';

const DEFAULT_LOCAL_API = 'http://192.168.1.14:8000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_LOCAL_API;

const TOKEN_KEY = 'cognify_token';
const REFRESH_TOKEN_KEY = 'cognify_refresh_token';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Client-Type': 'mobile',
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

// --- INTERCEPTORS ---

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
        if (!refreshToken) throw new Error('No refresh token available');
        
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Client-Type': 'mobile' } }
        );

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

// ============================================================================
//  SUBJECTS & CONTENT
// ============================================================================

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

// ============================================================================
//  ASSESSMENTS
// ============================================================================

export const listAssessmentsByModule = async (moduleId: string) => {
  try {
    // [FIX] Pass module_id param to backend AND remove client-side 'is_verified' check
    // This ensures newly populated/unverified assessments still show up for testing.
    const r = await api.get('/assessments/', { params: { module_id: moduleId } });
    const data = Array.isArray(r.data) ? r.data : (r.data?.items ?? []);
    
    // Robust check: Ensure we only return items that match the module ID
    return (data || []).filter((a: any) => String(a?.module_id ?? '') === String(moduleId));
  } catch (e) {
    console.log("Error fetching assessments:", e);
    return [];
  }
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
    '/users/me/assessment-submission',
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
  
  // Also check backend
  const endpoints = [`/assessments/submissions?assessment_id=${assessmentId}`];
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

// ============================================================================
//  DIAGNOSTICS
// ============================================================================

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

  const endpoints = ['/assessments/diagnostic', '/assessments/diagnostic/questions'];
  for (const ep of endpoints) {
    try {
      const r = await api.get(ep);
      const norm = normalize(r.data);
      if (norm.length) return norm;
    } catch {}
  }
  // Fallback
  try {
    const r = await api.get('/assessments/');
    return normalize(r.data);
  } catch {
    return [];
  }
};

export const setDiagnosticStatus = async (taken: boolean) => {
  try { await api.post('/users', { taken }); } catch (e) { return; }
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
  try { return (await api.post('/assessments/submissions', payload)).data; } catch {}
  try { return (await api.post('/assessments/diagnostic/submit', payload)).data; } catch {}
  try { return (await api.post('/profiles/me/diagnostic-submission', payload)).data; } catch {}
  return null;
};

export const getDiagnosticRecommendations = async () => {
  try {
    const profile = await getCurrentUserProfile();
    const userId = String(profile?.id ?? profile?.user_id ?? '');
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
  return {};
};

// ============================================================================
//  USER & ANALYTICS
// ============================================================================

export const getCurrentUserProfile = async () => {
  const token = await storage.getItem(TOKEN_KEY);
  if (!token) throw new Error('unauthenticated');
  // Prefer the profile endpoint which has rich student info
  try {
     const me = await api.get('/auth/me'); 
     if (me.data?.uid) {
         try {
             const studentProfile = await api.get(`/student/profile/${me.data.uid}`);
             return studentProfile.data;
         } catch {
             return me.data; 
         }
     }
     return me.data;
  } catch {
     const r1 = await api.get('/profiles/me');
     return r1.data;
  }
};

export const getStudentReportAnalytics = async (userId: string) => {
  // 1. Try generic analytics endpoint
  try {
    const r = await api.get(`/analytics/student_report/${userId}`);
    return r.data;
  } catch {
    // 2. Fallback to Student Profile from /student/ route
    try {
      const r = await api.get(`/student/profile/${userId}`);
      const profile = r.data;
      const si = profile?.student_info || {};
      
      return {
        data: {
          subject_performance: (si.progress_report || []).map((pr: any) => ({
            subject_id: pr.subject_id,
            average_score: pr.overall_completeness || 0
          })),
          overall_performance: {
            readiness_level: si.personal_readiness || profile.personal_readiness,
            passing_probability: mapReadinessToPercentage(si.personal_readiness || profile.personal_readiness)
          },
          progress_report: si.progress_report || []
        }
      };
    } catch {
      return {};
    }
  }
};

const mapReadinessToPercentage = (level: string) => {
  switch (level) {
    case 'HIGH': return 95;
    case 'MODERATE': return 75;
    case 'LOW': return 50;
    case 'VERY_LOW': return 25;
    default: return 0;
  }
};

// [NEW] Readiness & Recommendations
export const analyzeReadiness = async (userId: string) => {
  try {
    const response = await api.post(`/student/analyze-readiness/${userId}`);
    return response.data;
  } catch { return null; }
};

export const getStudentNextAction = async (userId: string) => {
  try {
    const r = await api.get(`/student/next-action/${userId}`);
    return r.data;
  } catch { return null; }
};

// ============================================================================
//  PROGRESS SYNC & SESSIONS
// ============================================================================

export const updateModuleProgress = async (
  moduleId: string,
  subjectId?: string,
  percentage?: number,
  status?: 'in_progress' | 'completed',
  timesTaken?: number,
  timeSpentSeconds?: number,
) => {
  const key = `module_progress:${moduleId}`;
  
  // 1. Local Storage
  try {
    await storage.setItem(key, JSON.stringify({ 
      percentage: percentage ?? 0, 
      subject_id: subjectId ?? '',
      status: status || (typeof percentage === 'number' && percentage >= 100 ? 'completed' : 'in_progress'),
      times_taken: timesTaken,
      time_spent: timeSpentSeconds,
      updated_at: new Date().toISOString()
    }));
    
    // Update subject cache
    if (subjectId) {
      const sKey = `subject_module_progress:${subjectId}`;
      const prev = await storage.getItem(sKey);
      const prevPct = prev ? Number(JSON.parse(prev)?.percentage ?? 0) || 0 : 0;
      const nextPct = Math.max(prevPct, Number(percentage ?? 0));
      await storage.setItem(sKey, JSON.stringify({ percentage: nextPct, updated_at: new Date().toISOString() }));
    }
  } catch (err) {
    console.warn('Failed to store module progress locally:', err);
  }

  // 2. Sync to Backend Profile (Optimistic)
  if (subjectId) {
    try {
      const profile = await getCurrentUserProfile();
      const si = (profile?.student_info ?? profile?.data?.student_info) || {};
      const reports = Array.isArray(si?.progress_report) ? [...si.progress_report] : [];
      
      const idx = reports.findIndex((r: any) => String(r.subject_id ?? r.subjectId ?? '') === String(subjectId));
      
      const currentModPct = Number(percentage ?? 0);
      
      let nextReports = [];
      if (idx >= 0) {
        const existing = reports[idx];
        const newModScore = Math.max(existing.modules_completeness || 0, currentModPct);
        const overall = Math.round((newModScore + (existing.assessment_completeness || 0)) / 2);
        
        reports[idx] = { 
            ...existing, 
            modules_completeness: newModScore, 
            overall_completeness: overall 
        };
        nextReports = reports;
      } else {
        const next = { 
            subject_id: subjectId, 
            modules_completeness: currentModPct, 
            assessment_completeness: 0, 
            overall_completeness: Math.round(currentModPct / 2), 
            weakest_competencies: [] 
        };
        nextReports = [...reports, next];
      }

      await api.put('/profiles/me', { student_info: { ...si, progress_report: nextReports } });
    } catch (err) {
      console.warn('Failed to sync progress to profile:', err);
    }
  }
};

export const getModuleProgress = async (moduleId: string) => {
  const key = `module_progress:${moduleId}`;
  try {
    const raw = await storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const updateAssessmentProgress = async (subjectId?: string, percentage?: number) => {
  const key = subjectId ? `subject_assessment_progress:${subjectId}` : '';
  
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
      const profile = await getCurrentUserProfile();
      const si = (profile?.student_info ?? profile?.data?.student_info) || {};
      const reports = Array.isArray(si?.progress_report) ? [...si.progress_report] : [];
      
      const idx = reports.findIndex((r: any) => String(r.subject_id) === String(subjectId));
      
      if (idx >= 0) {
          const existing = reports[idx];
          const overall = Math.round(((existing.modules_completeness || 0) + percentage) / 2);
          reports[idx] = { ...existing, assessment_completeness: percentage, overall_completeness: overall };
          await api.put('/profiles/me', { student_info: { ...si, progress_report: reports } });
      }
    } catch (err) {
      console.warn('Failed to update subject assessment completeness:', err);
    }
  }
};

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
    return { module_percentage: 0, assessment_percentage: 0, overall_percentage: 0 };
  }
};

// --- BEHAVIOR TRACKING ---

export const startStudySession = async (resourceId: string, resourceType: 'module' | 'quiz') => {
  try {
    const response = await api.post('/student/session/start', null, {
      params: { resource_id: resourceId, resource_type: resourceType }
    });
    return response.data; // Returns { session_id, ... }
  } catch (error) {
    console.warn("Tracking start failed", error);
    return null;
  }
};

export const updateStudySession = async (
  sessionId: string, 
  interruptions: number, 
  idleTime: number, 
  isFinished: boolean
) => {
  try {
    const response = await api.post(`/student/session/update/${sessionId}`, null, {
      params: { 
        interruptions, 
        idle_time_seconds: idleTime, 
        is_finished: isFinished 
      }
    });
    return response.data;
  } catch (error) {
    console.warn("Tracking update failed", error);
    return null;
  }
};

export { api, API_URL, REFRESH_TOKEN_KEY, TOKEN_KEY };