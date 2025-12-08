import { QuizScreen } from '@/components/diagnostic/QuizScreen';
import { 
  getAssessmentById, 
  listAssessmentsByModule, 
  markAssessmentTaken, 
  submitAssessmentSubmission, 
  updateAssessmentProgress,
  analyzeReadiness 
} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';

// [FIX] Extended type to match Backend Response
type QuestionObj = { 
  id?: string; 
  question_id?: string; 
  text?: string; 
  question?: string; 
  choices?: string[]; 
  correct_answers?: string | string[]; 
  options?: Array<{ id?: string; text?: string; value?: string; is_correct?: boolean }>; 
};

export default function DynamicQuizScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<QuestionObj[]>([]);
  // [FIX] Add loading state
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selections, setSelections] = useState<Record<number, number | null>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  // [FIX] Initialize timer with a default value (e.g., 10 minutes) so it's not 0
  const [timeLeft, setTimeLeft] = useState(600); 
  const [assessmentMeta, setAssessmentMeta] = useState<{ id?: string; module_id?: string; subject_id?: string } | null>(null);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => { navigation.getParent()?.setOptions({ tabBarStyle: undefined }); };
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!id) return;
      setLoading(true); // Start loading
      try {
        // 1. Try Fetching by Assessment ID
        const a = await getAssessmentById(String(id));
        if (mounted && a) {
          if (a.questions?.length > 0) {
            setQuestions(a.questions);
          }
          // [FIX] Use backend time limit if available, else keep default
          if (a.time_limit_minutes) setTimeLeft(a.time_limit_minutes * 60);
          
          setAssessmentMeta({ id: a.id, module_id: a.module_id, subject_id: a.subject_id });
          setLoading(false); // Done loading
          return;
        }
      } catch {}

      try {
        // 2. Fallback: Fetch by Module ID
        const list = await listAssessmentsByModule(String(id));
        const match = type ? list.find((item: any) => item.type === type) : list[0];
        const target = match || list[0];
        
        if (mounted && target) {
          if (target.questions?.length > 0) {
            setQuestions(target.questions);
          }
          // [FIX] Use backend time limit if available, else keep default
          if (target.time_limit_minutes) setTimeLeft(target.time_limit_minutes * 60);
          
          setAssessmentMeta({ id: target.id, module_id: target.module_id, subject_id: target.subject_id });
        }
      } catch {}
      if (mounted) setLoading(false); // Done loading even if failed
    };
    run();
    return () => { mounted = false; };
  }, [id, type]);

  // Timer tick
  useEffect(() => {
    if (loading || questions.length === 0) return; // Don't start timer if loading or empty
    let t: any;
    t = setInterval(() => setTimeLeft((s) => s > 0 ? s - 1 : 0), 1000);
    return () => { if (t) clearInterval(t); };
  }, [loading, questions.length]);

  const mappedQuestions = useMemo(() => {
    return (questions || []).map((q, idx) => {
      let opts: string[] = [];
      let correctIndex = -1;

      if (Array.isArray(q.choices) && q.choices.length > 0) {
          opts = q.choices;
          if (q.correct_answers) {
             const ans = Array.isArray(q.correct_answers) ? q.correct_answers[0] : q.correct_answers;
             correctIndex = opts.findIndex(o => o === ans);
          }
      } else if (Array.isArray(q.options)) {
          opts = q.options.map((o) => String(o?.text ?? o?.value ?? ''));
          correctIndex = q.options.findIndex((o) => !!o?.is_correct);
      }

      return {
        id: String(q?.question_id ?? q?.id ?? idx + 1),
        subject: '',
        question: String(q?.text ?? q?.question ?? 'Question Text Missing'),
        options: opts,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
      };
    });
  }, [questions]);

  const QUIZ_DATA_LENGTH = mappedQuestions.length;
  const currentQuestion = mappedQuestions[currentQuestionIndex];
  const progressPercent = QUIZ_DATA_LENGTH > 0 ? ((currentQuestionIndex + 1) / QUIZ_DATA_LENGTH) * 100 : 0;
  const isSubjectStart = currentQuestionIndex === 0;

  const themeColors = {
    background: isDarkMode ? '#121212' : '#F8F9FA',
    cardBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    textPrimary: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
    optionBorder: isDarkMode ? '#333333' : '#E0E0E0',
    optionSelectedBg: '#381E72',
    questionCardBg: isDarkMode ? '#2C2C2C' : '#EAFEFF',
    questionCardText: isDarkMode ? '#FFD700' : '#5C5428',
    questionCardBorder: isDarkMode ? '#444' : '#333',
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  const handleNext = async () => {
    if (selectedOptionIndex === null) return;
    setSelections((p) => ({ ...p, [currentQuestionIndex]: selectedOptionIndex }));
    
    if (currentQuestionIndex < QUIZ_DATA_LENGTH - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      setSelectedOptionIndex(null);
    } else {
      const finalSelections = { ...selections, [currentQuestionIndex]: selectedOptionIndex };
      const answers = mappedQuestions.map((q, idx) => ({
        question_id: q.id,
        answer: q.options[finalSelections[idx] ?? 0],
        is_correct: (finalSelections[idx] ?? -1) === q.correctIndex,
      }));
      
      const score = answers.filter((a) => a.is_correct).length;
      
      try {
        if (user?.id) {
            await submitAssessmentSubmission({
              user_id: user.id,
              assessment_id: assessmentMeta?.id,
              module_id: assessmentMeta?.module_id,
              subject_id: assessmentMeta?.subject_id,
              answers,
              score,
              total_items: QUIZ_DATA_LENGTH,
            });
            await analyzeReadiness(user.id);
        }
        if (assessmentMeta?.id) {
          try { await markAssessmentTaken(String(assessmentMeta.id)); } catch {}
        }
        try { 
            await updateAssessmentProgress(
                assessmentMeta?.subject_id ? String(assessmentMeta.subject_id) : undefined, 
                Math.round((score / QUIZ_DATA_LENGTH) * 100)
            ); 
        } catch {}
      } catch (e) { console.warn(e); }
      
      router.back();
    }
  };

  // [FIX] Handle Loading State
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.optionSelectedBg} />
      </View>
    );
  }

  // [FIX] Handle Empty State (No Questions) - Prevents Dead End
  if (QUIZ_DATA_LENGTH === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background, padding: 20 }]}>
        <Text style={{ color: themeColors.textPrimary, fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          Sorry, no questions were found for this quiz.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!currentQuestion) return null;

  return (
    <QuizScreen
      QUIZ_DATA_LENGTH={QUIZ_DATA_LENGTH}
      currentQuestionIndex={currentQuestionIndex}
      currentQuestion={currentQuestion as any}
      selectedOptionIndex={selectedOptionIndex}
      progressPercent={progressPercent}
      isSubjectStart={isSubjectStart}
      timeLeft={timeLeft}
      isDarkMode={isDarkMode}
      themeColors={themeColors as any}
      formatTime={formatTime}
      handleNext={handleNext}
      setSelectedOptionIndex={setSelectedOptionIndex}
      setIsDarkMode={setIsDarkMode}
      routerBack={() => router.back()}
    />
  );
}

// [FIX] Add styles for loading/error states
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorButton: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#381E72', borderRadius: 8 },
  errorButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});