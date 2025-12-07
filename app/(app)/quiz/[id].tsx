import { QuizScreen } from '@/components/diagnostic/QuizScreen';
import { getAssessmentById, listAssessmentsByModule, markAssessmentTaken, submitAssessmentSubmission, updateAssessmentProgress } from '@/lib/api';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
type QuestionObj = { id?: string; question_id?: string; text?: string; question?: string; options?: Array<{ id?: string; text?: string; value?: string; is_correct?: boolean }>; };

export default function DynamicQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const [questions, setQuestions] = useState<QuestionObj[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selections, setSelections] = useState<Record<number, number | null>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [assessmentMeta, setAssessmentMeta] = useState<{ id?: string; module_id?: string; subject_id?: string } | null>(null);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => { navigation.getParent()?.setOptions({ tabBarStyle: undefined }); };
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!id) return;
      try {
        const a = await getAssessmentById(String(id));
        const qs = Array.isArray(a?.questions) ? a.questions : [];
        if (mounted) {
          setQuestions(qs);
          setAssessmentMeta({ id: a?.id, module_id: a?.module_id, subject_id: a?.subject_id });
        }
      } catch {
        try {
          const list = await listAssessmentsByModule(String(id));
          const first = Array.isArray(list) ? list[0] : null;
          const qs = Array.isArray(first?.questions) ? first?.questions : [];
          if (mounted) {
            setQuestions(qs);
            setAssessmentMeta({ id: first?.id, module_id: first?.module_id, subject_id: first?.subject_id });
          }
        } catch {}
      }
    };
    run();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let t: any;
    t = setInterval(() => setTimeLeft((s) => s > 0 ? s - 1 : 0), 1000);
    return () => { if (t) clearInterval(t); };
  }, []);

  const mappedQuestions = useMemo(() => {
    return (questions || []).map((q, idx) => {
      const opts = (q.options || []).map((o) => String(o?.text ?? o?.value ?? ''));
      const correctIndex = (q.options || []).findIndex((o) => !!o?.is_correct);
      return {
        id: String(q?.question_id ?? q?.id ?? idx + 1),
        subject: '',
        question: String(q?.text ?? q?.question ?? ''),
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
      const answers = mappedQuestions.map((q, idx) => ({
        question_id: q.id,
        answer: selections[idx] ?? null,
        is_correct: (selections[idx] ?? -1) === q.correctIndex,
      }));
      const score = answers.filter((a) => a.is_correct).length;
      try {
        await submitAssessmentSubmission({
          assessment_id: assessmentMeta?.id,
          module_id: assessmentMeta?.module_id,
          subject_id: assessmentMeta?.subject_id,
          answers,
          score,
          total_items: QUIZ_DATA_LENGTH,
        });
        if (assessmentMeta?.id) {
          try { await markAssessmentTaken(String(assessmentMeta.id)); } catch {}
        }
        try { await updateAssessmentProgress(assessmentMeta?.subject_id ? String(assessmentMeta.subject_id) : undefined, 100); } catch {}
      } catch {}
      router.back();
    }
  };

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
