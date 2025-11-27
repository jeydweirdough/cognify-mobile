// --- ENUMS (Based on backend database/enums.py) ---
export type UserRole = 'student' | 'faculty' | 'admin' | 'guest';
export type AssessmentType = 'pre_assessment' | 'post_assessment' | 'quiz';
export type QuestionType = 'multiple_choice' | 'true_or_false' | 'identification';
export type ProgressStatus = 'in_progress' | 'completed' | 'not_started';
export type BloomTaxonomy = 'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating';
export type PersonalReadinessLevel = 'low' | 'medium' | 'high';
export type DifficultyLevel = 'easy' | 'moderate' | 'difficult';

// --- BASE SCHEMAS ---
export interface Timestamp {
  created_at: string; // datetime is string on frontend
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Verification {
  is_verified: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
}

// --- USER & PROFILE TYPES ---
export interface StudentBehaviorProfile {
  average_session_length: number; // in minutes
  preferred_study_time: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Any';
  interruption_frequency: 'Low' | 'Medium' | 'High';
  learning_pace: 'Fast' | 'Standard' | 'Slow';
  reading_pattern: 'continuous' | 'chunked' | 'quick_scanner'; // NEW
  assessment_pace: 'rushed' | 'moderate' | 'thoroug'; // NEW
  focus_level: 'High' | 'Medium' | 'Low'; // NEW
  last_updated?: string | null; // NEW
}

export interface StudentProgressReport {
  subject_id: string;
  modules_completeness: number; // 0-100
  assessment_completeness: number; // 0-100
  overall_completeness: number; // 0-100
  weakest_competencies: string[]; // List of Competency Codes or IDs
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface StudentCompetencyPerformance {
  competency_id: string;
  mastery_percentage: number; // 0.0 to 100.0
}

export interface StudentInfo { // Renamed from StudentSchema for clarity
  user_id: string;
  personal_readiness?: PersonalReadinessLevel | null;
  confident_subject?: string[] | null;
  timeliness: number; // TBD: What does this represent? Keeping as number.
  
  // New Behavioral Data
  behavior_profile: StudentBehaviorProfile;

  progress_report?: StudentProgressReport[] | null;
  competency_performance?: StudentCompetencyPerformance[] | null;
  recommended_study_modules?: string[] | null;
}

export interface User extends Timestamp, Verification { // Extends Timestamp and Verification
  id: string; // Renamed from user_id in backend schema to match frontend convention
  email: string;
  first_name?: string;
  middle_name?: string; // NEW
  last_name?: string;
  username?: string; // NEW
  role_id?: string;
  role?: UserRole; // Added to map role_id to a human-readable role
  
  // Progress/Analytics properties (from StudentSchema/UserProfileBase)
  pre_assessment_score?: number; // Kept from original
  ai_confidence?: number; // Kept from original
  current_module?: string; // Kept from original
  progress?: Record<string, number>; // { "Theories": 0.65, "Globalization": 0.45 } - Kept from original
  
  // New/Updated properties
  is_registered: boolean; // From UserProfileBase
  fcm_token?: string; // Kept from original
  profile_picture?: string | null; // From UserProfileBase
  student_info?: StudentInfo | null; // From UserProfileBase
}

// --- SUBJECT & TOS TYPES ---
export interface Competency extends Timestamp {
  id: string; // Added for frontend/API reference
  code: string;  // e.g., "1.1"
  description: string;
  target_bloom_level: BloomTaxonomy;
  target_difficulty: DifficultyLevel;
  allocated_items: number;
}

export interface Topic extends Timestamp {
  id: string; // Added for frontend/API reference
  title: string;
  weight_percentage: number;
  competencies: Competency[];
  lecture_content?: string | null;
  image?: string | null;
}

export interface Subject extends Timestamp { // Extends Timestamp
  id: string; // Renamed from subject_id to id
  title: string;
  description?: string;
  pqf_level?: number;
  active_tos_id?: string; // Kept from original

  // UI property for SubjectCard
  percentage?: number; // Kept from original: student progress percentage
  
  // New from backend
  total_weight_percentage: number; // Should be 100.0
  topics: Topic[]; // The new TOS structure is embedded
}

export interface ModuleListItem {
  id: string;
  title: string;
  author: string; // Faked for display, as Topic doesn't have an author field
  progress: number;
  quizTaken: boolean; // Faked/derived
  lectureContentUrl: string | null; // The URL to the PDF
}

// Keeping these original TOS types for legacy/API compatibility if needed, but the Subject structure is the new source of truth.
// If your backend only uses the Competency/Topic/Subject structure now, these may be redundant.
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

// --- LEARNING CONTENT TYPES ---
export interface Module extends Timestamp, Verification { // Extends Timestamp and Verification
  id: string;
  subject_id?: string;
  title?: string;
  purpose?: string;
  bloom_level?: BloomTaxonomy; // Changed to use Enum type
  material_type?: string;
  material_url?: string;
  estimated_time?: number;
  generated_summary_id?: string;
  generated_quiz_id?: string;
  generated_flashcards_id?: string;
  deleted?: boolean;
}

export interface Question extends Timestamp, Verification { // Extends Timestamp and Verification
  id: string; // Renamed from question_id
  text: string; // Renamed from question
  type: QuestionType;
  choices?: string[] | null; // Renamed from options
  correct_answers?: string | boolean | string[] | null; // Renamed from answer, more flexible type
  
  // STRICT ALIGNMENT TO TOS
  competency_id: string; // NEW
  bloom_taxonomy: BloomTaxonomy; // Renamed from bloom_level
  difficulty_level: DifficultyLevel; // NEW
  
  // Response/Request Fields
  created_by?: string; // NEW: From QuestionResponse
  rationale?: string; // NEW: From QuestionCreateRequest
  references?: string[] | null; // NEW: From QuestionCreateRequest
  tags?: string[] | null; // NEW: From QuestionCreateRequest
}

export interface Assessment extends Timestamp, Verification { // Extends Timestamp and Verification
  id: string;
  title: string;
  type: AssessmentType; // Updated from type: string
  subject_id: string;
  
  // Kept from original (might be redundant if questions list is used)
  instructions?: string;
  total_items: number;
  
  // New from backend
  blueprint?: {
    subject_id: string;
    target_topics: string[]; // List of Topic IDs to include
    total_items: number;
    easy_percentage: number;
    moderate_percentage: number;
    difficult_percentage: number;
  } | null;
  questions: Question[]; // Uses the updated Question interface
}

// Quiz type is a simpler version of Assessment/Question, keeping for now
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

// --- AI-GENERATED CONTENT TYPES ---
export interface GeneratedSummary extends Timestamp { // Extends Timestamp
  id: string;
  module_id: string;
  subject_id: string;
  summary_text: string;
  source_url: string;
  source_char_count: number;
  tos_topic_title?: string;
  aligned_bloom_level?: BloomTaxonomy; // Updated to use Enum type
}

export interface GeneratedQuestion { // Used inside GeneratedQuiz
  question: string;
  options: string[];
  answer: string;
  tos_topic_title?: string;
  aligned_bloom_level?: BloomTaxonomy; // Updated to use Enum type
}

export interface GeneratedQuiz extends Timestamp { // Extends Timestamp
  id: string;
  module_id: string;
  subject_id: string;
  questions: GeneratedQuestion[];
  source_url: string;
  source_char_count: number;
  tos_topic_title?: string;
  aligned_bloom_level?: BloomTaxonomy; // Updated to use Enum type
}

export interface GeneratedFlashcard { // Used inside GeneratedFlashcards
  question: string;
  answer: string;
  tos_topic_title?: string;
  aligned_bloom_level?: BloomTaxonomy; // Updated to use Enum type
}

export interface GeneratedFlashcards extends Timestamp { // Extends Timestamp
  id: string;
  module_id: string;
  subject_id: string;
  flashcards: GeneratedFlashcard[];
  source_url: string;
  source_char_count: number;
  tos_topic_title?: string;
  aligned_bloom_level?: BloomTaxonomy; // Updated to use Enum type
}

// --- ACTIVITY & ANALYTICS TYPES ---
export interface Activity extends Timestamp { // Extends Timestamp
  id: string;
  user_id: string;
  subject_id?: string;
  activity_type?: string; // "module" | "quiz" | "assessment"
  activity_ref?: string; // ID of the activity
  bloom_level?: BloomTaxonomy; // Updated to use Enum type
  score?: number;
  completion_rate?: number;
  duration?: number; // seconds
  timestamp?: string; // Kept from original, potentially redundant with created_at
}

export interface AssessmentSubmission extends Timestamp { // NEW
  id: string; // Added for frontend/API reference
  user_id: string;
  assessment_id: string;
  subject_id: string;
  
  answers: {
    question_id: string;
    answer: string | boolean | string[];
    is_correct: boolean;
    competency_id: string;
  }[];
  
  score: number;
  total_items: number;
  time_taken_seconds: number;
  submitted_at: string; // Kept as string (datetime)
}


export interface StudySessionLog extends Timestamp { // NEW
  id: string; // Added for frontend/API reference
  user_id: string;
  resource_id: string; // ID of the Module or Assessment
  resource_type: 'module' | 'assessment';
  
  start_time: string;
  end_time?: string | null;
  duration_seconds: number;
  
  // Behavioral Metrics
  interruptions_count: number;
  idle_time_seconds: number;
  
  completion_status: ProgressStatus; // Updated to use Enum type
}


// --- RECOMMENDATION TYPE ---
export interface Recommendation {
  id: string;
  user_id: string;
  subject_id: string;
  recommended_topic: string;
  recommended_modules: string[]; // List of module IDs
  recommended_quizzes: string[]; // List of quiz IDs
  bloom_focus: BloomTaxonomy; // Updated to use Enum type
  priority: 'high' | 'medium' | 'low';
  reason: string;
  diagnostic_result_id?: string;
  confidence: number;
  timestamp?: string; // Kept from original
}
// --- END FIX ---


// --- ANALYTICS & REPORTS ---
export interface StudentAnalytics {
  student_id: string;
  summary: {
    total_activities: number;
    overall_score: number;
    time_spent_sec: number;
  };
  performance_by_bloom: Record<BloomTaxonomy, number>; // { "remembering": 85.0, "applying": 72.0 } - Updated to use Enum key
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

// --- NEW ADMIN & NOTIFICATION TYPES ---
export interface PreRegisteredUser extends Timestamp { // NEW
  id: string; // Added for frontend/API reference
  email: string;
  assigned_role: UserRole; // Updated to use Enum type
  added_by: string; // Admin ID
  is_registered: boolean;
  registered_at?: string | null;
  user_id?: string | null;
}

export interface Announcement extends Timestamp { // NEW
  id: string; // Added for frontend/API reference
  title: string;
  content: string;
  target_audience: UserRole[]; // Updated to use Enum type
  is_global: boolean;
  author_id: string;
}

export interface Notification extends Timestamp { // NEW
  id: string; // Added for frontend/API reference
  user_id: string;
  title: string;
  message: string;
  type: string; // announcement, verification, reminder, alert
  is_read: boolean;
  related_id?: string | null;
}

export interface MaterialVerificationQueue { // NEW - Response model for Admins
  item_id: string;
  type: 'question' | 'assessment' | 'module';
  title: string;
  submitted_by: string;
  submitted_at: string;
}

// --- PAGINATION RESPONSE ---
export interface PaginatedResponse<T> {
  items: T[];
  last_doc_id?: string | null;
}