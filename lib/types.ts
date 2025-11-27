// User & Profile Types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  nickname?: string;
  role_id?: string;
  pre_assessment_score?: number;
  ai_confidence?: number;
  current_module?: string;
  progress?: Record<string, number>; // { "Theories": 0.65, "Globalization": 0.45 }
  fcm_token?: string;
  created_at?: string;
}

// Subject & TOS Types
export interface Subject {
  subject_id: string;
  title: string;
  description?: string; // Added this from backend model
  pqf_level?: number;
  active_tos_id?: string;
  
  // Added UI property for SubjectCard
  percentage?: number; // <--- ADD THIS

}

export interface BloomEntry {
  [key: string]: number; // e.g., { "remembering": 8 }
}

export interface SubContent {
  purpose?: string;
  blooms_taxonomy?: BloomEntry[];
}

export interface ContentSection {
  title?: string;
  sub_content?: SubContent[];
  no_items?: number;
  weight_total?: number;
}

export interface TOS {
  id: string;
  subject_name?: string;
  pqf_level?: number;
  difficulty_distribution?: Record<string, number>;
  content?: ContentSection[];
  total_items?: number;
  created_at?: string;
}

// Learning Content Types
export interface Module {
  id: string;
  subject_id?: string;
  title?: string;
  purpose?: string;
  bloom_level?: string;
  material_type?: string;
  material_url?: string;
  estimated_time?: number;
  generated_summary_id?: string;
  generated_quiz_id?: string;
  generated_flashcards_id?: string;
  created_at?: string;
  deleted?: boolean;
}

export interface Question {
  question_id: string;
  topic_title?: string;
  bloom_level?: string;
  question?: string;
  options?: string[];
  answer?: string;
}

export interface Assessment {
  id: string;
  type?: string;
  subject_id?: string;
  title?: string;
  instructions?: string;
  total_items?: number;
  questions?: Question[];
  created_at?: string;
}

export interface Quiz {
  id: string;
  subject_id?: string;
  topic_title?: string;
  bloom_level?: string;
  question?: string;
  options?: string[];
  answer?: string;
  created_at?: string;
}

// AI-Generated Content Types
export interface GeneratedSummary {
  id: string;
  module_id: string;
  subject_id: string;
  summary_text: string;
  source_url: string;
  source_char_count: number;
  tos_topic_title?: string;
  aligned_bloom_level?: string;
  created_at?: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  tos_topic_title?: string;
  aligned_bloom_level?: string;
}

export interface GeneratedQuiz {
  id: string;
  module_id: string;
  subject_id: string;
  questions: GeneratedQuestion[];
  source_url: string;
  source_char_count: number;
  tos_topic_title?: string;
  aligned_bloom_level?: string;
  created_at?: string;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  tos_topic_title?: string;
  aligned_bloom_level?: string;
}

export interface GeneratedFlashcards {
  id: string;
  module_id: string;
  subject_id: string;
  flashcards: GeneratedFlashcard[];
  source_url: string;
  source_char_count: number;
  tos_topic_title?: string;
  aligned_bloom_level?: string;
  created_at?: string;
}

// Activity & Analytics Types
export interface Activity {
  id: string;
  user_id: string;
  subject_id?: string;
  activity_type?: string; // "module" | "quiz" | "assessment"
  activity_ref?: string; // ID of the activity
  bloom_level?: string;
  score?: number;
  completion_rate?: number;
  duration?: number; // seconds
  timestamp?: string;
  created_at?: string;
}

// --- FIX: This is now the one-and-only Recommendation type ---
export interface Recommendation {
  id: string;
  user_id: string;
  subject_id: string;
  recommended_topic: string;
  recommended_modules: string[]; // List of module IDs
  recommended_quizzes: string[]; // List of quiz IDs
  bloom_focus: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  diagnostic_result_id?: string;
  confidence: number;
  timestamp?: string;
}
// --- END FIX ---


// Analytics & Reports
export interface StudentAnalytics {
  student_id: string;
  summary: {
    total_activities: number;
    overall_score: number;
    time_spent_sec: number;
  };
  performance_by_bloom: Record<string, number>; // { "remembering": 85.0, "applying": 72.0 }
  prediction: {
    predicted_to_pass: boolean;
    pass_probability: number;
    overall_score: number;
  };
  last_updated: string;
}

export interface Motivation {
  quote: string;
  author: string;
}

// Pagination Response
export interface PaginatedResponse<T> {
  items: T[];
  last_doc_id?: string | null;
}