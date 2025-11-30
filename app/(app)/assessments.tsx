/// @/components/diagnostic/Assessments.tsx

import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, SafeAreaView, StatusBar } from "react-native";
// Assuming Fonts import is available from parent context/structure

// Import separated components
import { AssessmentResultScreen } from "@/components/diagnostic/AssessmentResultScreen";
import { AssessmentReviewScreen } from "@/components/diagnostic/AssessmentReviewScreen";
import { AssessmentStartScreen } from "@/components/diagnostic/AssessmentStartScreen";
import { QuizScreen } from "@/components/diagnostic/QuizScreen";
import { useAuth } from "@/lib/auth";
import { getDiagnosticAssessmentQuestions, getDiagnosticRecommendations, getSubjectTopics, hasTakenDiagnostic, setDiagnosticStatus, submitDiagnosticSubmission } from "../../lib/api";
import { storage } from "../../lib/storage";

const { width } = Dimensions.get("window");
const INITIAL_TIME_SECONDS = 1200; // 20 minutes for 20 questions

// --- New Interface for Subject Scores (Needed by AssessmentResultScreen) ---
interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
}
// -------------------------------------------------------------------------

let LAST_DIAGNOSTIC_SUBJECT_SCORES: SubjectScore[] = [];

interface QuestionData {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
}



// --- UTILITY FUNCTION FOR SAVING RESULTS ---
// NOTE: Assuming window.storage is a placeholder for AsyncStorage or similar
const saveAssessmentResults = async (
  storageKey: string,
  score: number,
  totalQuestions: number,
  subjectScores: SubjectScore[],
  recommendedSubjects?: string[]
) => {
  try {
    const assessmentData = {
      score,
      totalQuestions,
      subjectScores,
      recommendedSubjects,
      timestamp: new Date().toISOString(),
    };

    await storage.setItem(storageKey, JSON.stringify(assessmentData));

    console.log("Assessment results saved successfully:", assessmentData);
  } catch (error) {
    console.error("Failed to save assessment results:", error);
  }
};
// ------------------------------------------

// --- MAIN SCREEN ---
export default function AssessmentsScreen() {
  // --- STATE ---
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [quizData, setQuizData] = useState<QuestionData[]>([]);

  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [recommendedSubjects, setRecommendedSubjects] = useState<string[]>([]);

  const { user } = useAuth();

  // User Answers Storage
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    new Array(quizData.length).fill(null)
  );

  // Timer State
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_SECONDS);
  const timerRef = useRef<number | null>(null);

  // --- THEME COLORS ---
  const themeColors = {
    background: isDarkMode ? "#121212" : "#F8F9FA",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#B0B0B0" : "#666666",
    cardBg: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    optionBorder: isDarkMode ? "#333333" : "#E0E0E0",
    optionSelectedBg: "#381E72",
    questionCardBg: "#EAFEFF",
    questionCardText: "#5C5428",
    questionCardBorder: "#4B3E62",
  };

  const currentQuestion = quizData[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / quizData.length) * 100;
  const isSubjectStart =
    currentQuestionIndex === 0 ||
    currentQuestion.subject !== quizData[currentQuestionIndex - 1].subject;

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isQuizStarted && !isQuizFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number; // Use as number for proper interval ID type
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isQuizStarted, isQuizFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- HANDLERS ---
  const handleStart = async () => {
    try {
      const already = await hasTakenDiagnostic();
      if (already) {
        Alert.alert("Assessment already completed", "You can review your results with Cognify.");
        router.back();
        return;
      }
      const items: any[] = await getDiagnosticAssessmentQuestions();
      const diagnostics = items.filter((a) => (a?.purpose ?? a?.type) === "Diagnostic");
      const subjectIds = Array.from(new Set(diagnostics.map((a) => a?.subject_id).filter(Boolean)));
      const subjectMap: Record<string, string> = {};
      if (subjectIds.length) {
        const results = await Promise.all(subjectIds.map((id) => getSubjectTopics(String(id)).then((s) => ({ id, title: s?.title ?? String(id) })).catch(() => ({ id, title: String(id) }))));
        results.forEach(({ id, title }) => { subjectMap[id] = title; });
      }
      const questions: QuestionData[] = [];
      diagnostics.forEach((ass, idxA) => {
        const subj = ass?.subject_id ? (subjectMap[ass.subject_id] ?? String(ass.subject_id)) : (ass?.subject?.title ?? ass?.subject ?? "General");
        const qs = Array.isArray(ass?.questions) ? ass.questions : [];
        qs.forEach((q: any, idxQ: number) => {
          const rawOpts = q?.options ?? q?.choices ?? q?.answers ?? q?.options_map ?? {};
          const optsArr = Array.isArray(rawOpts)
            ? rawOpts
            : rawOpts && typeof rawOpts === "object"
              ? Object.values(rawOpts)
              : [];
          const options = Array.isArray(optsArr)
            ? optsArr.map((o: any) => String(o))
            : [];

          let ciRaw =
            q?.correctIndex ??
            q?.correct_index ??
            q?.correctChoice ??
            q?.correct_answer ??
            q?.correct ??
            q?.answer_index ??
            q?.answer;
          let ciNum: number = 0;
          if (typeof ciRaw === "number") {
            ciNum = Number(ciRaw);
          } else if (typeof ciRaw === "string") {
            const upper = ciRaw.trim().toUpperCase();
            const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
            if (letterMap[upper] !== undefined) {
              ciNum = letterMap[upper];
            } else {
              const idx = options.findIndex(
                (o) => o.trim().toUpperCase() === upper || o.trim() === ciRaw.trim()
              );
              ciNum = idx >= 0 ? idx : 0;
            }
          } else {
            ciNum = 0;
          }

          questions.push({
            id: Number(q?.id ?? idxA * 1000 + idxQ + 1),
            subject: String(q?.subject?.title ?? q?.subject ?? subj),
            question: String(q?.question ?? q?.text ?? q?.prompt ?? ""),
            options,
            correctIndex: ciNum,
          });
        });
      });
      if (questions.length) {
        setQuizData(questions);
        setUserAnswers(new Array(questions.length).fill(null));
        setCurrentQuestionIndex(0);
        setSelectedOptionIndex(null);
        setScore(0);
        setIsQuizFinished(false);
        setIsReviewing(false);
        setTimeLeft(INITIAL_TIME_SECONDS);
      }
    } finally {
      setIsQuizStarted(true);
    }
  };
  const handleReviewPress = () => setIsReviewing(true);
  const routerBack = () => router.back();

  // FIX: Updated finishQuiz to calculate and save results before setting isQuizFinished
  const finishQuiz = (timedOut = false) => {
    // 1. Calculate scores immediately before setting state to finished
    const subjectScores = calculateSubjectScores();

    // 2. Compute recommendations and save
    const recommended = recommendWeakSubjects(subjectScores, 2);
    const storageKey = user?.id ? `diagnostic_assessment_results:${user.id}` : 'diagnostic_assessment_results';
    saveAssessmentResults(storageKey, score, quizData.length, subjectScores, recommended);
    setDiagnosticStatus(true);

    LAST_DIAGNOSTIC_SUBJECT_SCORES = subjectScores;
    setSubjectScores(subjectScores);
    setRecommendedSubjects(recommended);

    try {
      const answers = quizData.map((q, idx) => ({
        question_id: q.id,
        answer: userAnswers[idx] != null && q.options[userAnswers[idx] as number] != null ? q.options[userAnswers[idx] as number] : userAnswers[idx],
        is_correct: userAnswers[idx] != null && userAnswers[idx] === q.correctIndex,
      }));
      const timeTaken = INITIAL_TIME_SECONDS - timeLeft;
      const payload = {
        user_id: user?.id,
        assessment_id: 'diagnostic',
        subject_id: 'diagnostic',
        answers,
        score,
        total_items: quizData.length,
        time_taken_seconds: timeTaken,
      };
      submitDiagnosticSubmission(payload).catch(() => {});
      getDiagnosticRecommendations().then((data) => {
        const rec = Array.isArray(data?.recommendedSubjects) ? data.recommendedSubjects : [];
        if (rec.length) setRecommendedSubjects(rec.slice(0, 2));
      }).catch(() => {});
    } catch {}

    setIsQuizFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (timedOut)
      Alert.alert("Time's Up!", "Your assessment was submitted automatically.");
  };

  const handleNext = () => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = selectedOptionIndex;
    setUserAnswers(updatedAnswers);

    // Only update score if an option was selected and it was correct
    if (
      selectedOptionIndex !== null &&
      selectedOptionIndex === currentQuestion.correctIndex
    ) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      finishQuiz(false);
    }
  };

  // --- KNOWLEDGE MAPPING CALCULATION ---
  const calculateSubjectScores = (): SubjectScore[] => {
    const subjectScoresMap = quizData.reduce((acc, question, index) => {
      const subject = question.subject;
      const isCorrect =
        userAnswers[index] !== null &&
        userAnswers[index] === question.correctIndex;

      if (!acc[subject]) {
        acc[subject] = { subject: subject, correct: 0, total: 0 };
      }
      acc[subject].total += 1;
      if (isCorrect) {
        acc[subject].correct += 1;
      }
      return acc;
    }, {} as Record<string, SubjectScore>);

    return Object.values(subjectScoresMap);
  };
  // ---------------------------------------------------

  const recommendWeakSubjects = (scores: SubjectScore[], count = 2): string[] => {
    const sorted = scores.slice().sort((a, b) => (a.correct / a.total) - (b.correct / b.total));
    const n = Math.max(1, Math.min(count, sorted.length));
    return sorted.slice(0, n).map((s) => s.subject);
  };

  // --- RENDER: START SCREEN ---
  if (!isQuizStarted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar barStyle="dark-content" />
        <AssessmentStartScreen onStartPress={handleStart} />
      </SafeAreaView>
    );
  }

  // --- RENDER: REVIEW SCREEN ---
  if (isReviewing) {
    return (
      <AssessmentReviewScreen QUIZ_DATA={quizData} userAnswers={userAnswers} />
    );
  }

  // --- RENDER: RESULT SCREEN (FIXED) ---
  if (isQuizFinished) {
    return (
      <AssessmentResultScreen
        score={score}
        totalQuestions={quizData.length}
        onReviewPress={handleReviewPress}
        recommendedSubjects={recommendedSubjects}
        subjectScores={subjectScores}
      />
    );
  }

  // --- RENDER: QUIZ SCREEN ---
  return (
    <QuizScreen
      QUIZ_DATA_LENGTH={quizData.length}
      currentQuestionIndex={currentQuestionIndex}
      currentQuestion={currentQuestion}
      selectedOptionIndex={selectedOptionIndex}
      progressPercent={progressPercent}
      isSubjectStart={isSubjectStart}
      timeLeft={timeLeft}
      isDarkMode={isDarkMode}
      themeColors={themeColors}
      formatTime={formatTime}
      handleNext={handleNext}
      setSelectedOptionIndex={setSelectedOptionIndex}
      setIsDarkMode={setIsDarkMode}
      routerBack={routerBack}
    />
  );
}
