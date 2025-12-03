// @/components/diagnostic/Assessments.tsx
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions } from "react-native";

// Import separated components
import { AssessmentResultScreen } from "@/components/diagnostic/AssessmentResultScreen";
import { AssessmentReviewScreen } from "@/components/diagnostic/AssessmentReviewScreen";
import { AssessmentStartScreen } from "@/components/diagnostic/AssessmentStartScreen";
import { QuizScreen } from "@/components/diagnostic/QuizScreen";
import { useAuth } from "@/lib/auth";
import {
  getDiagnosticAssessmentQuestions,
  getDiagnosticRecommendations,
  hasTakenDiagnostic,
  listSubjects,
  setDiagnosticStatus,
  submitDiagnosticSubmission,
} from "../../lib/api";
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
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [quizData, setQuizData] = useState<QuestionData[]>([]);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [recommendedSubjects, setRecommendedSubjects] = useState<string[]>([]);
  const { user } = useAuth();

  // User Answers Storage
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

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
  const progressPercent = quizData.length > 0 
    ? ((currentQuestionIndex + 1) / quizData.length) * 100 
    : 0;
  const isSubjectStart =
    currentQuestionIndex === 0 ||
    (currentQuestion && quizData[currentQuestionIndex - 1] && 
     currentQuestion.subject !== quizData[currentQuestionIndex - 1].subject);

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
      }, 1000) as unknown as number;
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

  const pickText = (val: any): string => {
    if (val == null) return "";
    if (typeof val === "string" || typeof val === "number") return String(val);
    if (Array.isArray(val)) {
      for (const v of val) {
        const s = pickText(v);
        if (s) return s;
      }
      return "";
    }
    if (typeof val === "object") {
      const keys = [
        "text",
        "label",
        "value",
        "option",
        "answer",
        "title",
        "name",
        "content",
        "option_text",
        "choice_text",
        "answer_text",
        "description",
      ];
      for (const k of keys) {
        if (k in val) {
          const s = pickText(val[k]);
          if (s) return s;
        }
      }
      for (const v of Object.values(val)) {
        const s = pickText(v);
        if (s) return s;
      }
    }
    return "";
  };

  const extractOptions = (q: any): string[] => {
    const candidates = [
      q?.options,
      q?.choices,
      q?.answers,
      q?.options_map,
      q?.optionsMap,
      q?.choices_map,
      q?.choicesMap,
      q?.options_dict,
      q?.choices_dict,
      q?.options_by_letter,
      q?.choices_by_letter,
    ];
    for (const cand of candidates) {
      if (!cand) continue;
      let arr: any[] = [];
      if (Array.isArray(cand)) {
        arr = cand;
      } else if (typeof cand === "object") {
        arr = Object.values(cand);
      }
      if (arr.length) {
        const mapped = arr
          .map((o: any) => pickText(o))
          .filter((s: string) => s && s.length > 0);
        if (mapped.length) return mapped;
      }
    }
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const letterValues: string[] = [];
    letters.forEach((L) => {
      const v = q?.[L] ?? q?.[L.toLowerCase()];
      const s = pickText(v);
      if (s) letterValues.push(s);
    });
    return letterValues;
  };

  // --- HANDLERS ---
  const handleStart = async () => {
    try {
      const already = await hasTakenDiagnostic();
      if (already) {
        Alert.alert(
          "Assessment already completed",
          "You can review your results with Cognify."
        );
        router.back();
        return;
      }

      // Fetch all subjects first to create a mapping
      const subjectsList = await listSubjects().catch(() => [] as any[]);
      const subjectTitleById: Record<string, string> = {};
      
      (subjectsList || []).forEach((s: any) => {
        const id = String(s?.id ?? s?.subject_id ?? "");
        const title = String(s?.title ?? s?.subject_title ?? "");
        if (id && title) {
          subjectTitleById[id] = title;
        }
      });

      const SUBJECT_CODE_TITLE_MAP: Record<string, string> = {
        SUBJ_ABNORMAL_PSYCH: "Abnormal Psychology",
        SUBJ_DEV_PSYCH: "Developmental Psychology",
        SUBJ_IO_PSYCH: "Industrial-Organizational Psychology",
        SUBJ_PSYC_ASSESS: "Psychological Assessment",
      };

      console.log("Subject mapping:", subjectTitleById);

      // Fetch diagnostic assessment questions
      const items: any[] = await getDiagnosticAssessmentQuestions();
      const diagnostics = items.filter(
        (a) => (a?.purpose ?? a?.type) === "Diagnostic"
      );

      const questions: QuestionData[] = [];
      
      diagnostics.forEach((ass, idxA) => {
        // Get subject_id from assessment
        const subjId = String(ass?.subject_id ?? "");
        const fallbackSubject = ass?.subject?.title ?? ass?.subject ?? subjId;
        const subj = String(
          SUBJECT_CODE_TITLE_MAP[subjId] ??
            subjectTitleById[subjId] ??
            fallbackSubject ??
            "General"
        );

        console.log(`Processing assessment with subject_id: ${subjId}, resolved to: ${subj}`);

        const qs = Array.isArray(ass?.questions) ? ass.questions : [];
        qs.forEach((q: any, idxQ: number) => {
          const options = extractOptions(q);
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
          } else if (Array.isArray(ciRaw)) {
            const s = pickText(ciRaw[0]);
            const upper = s.trim().toUpperCase();
            const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
            if (letterMap[upper] !== undefined) {
              ciNum = letterMap[upper];
            } else {
              const idx = options.findIndex(
                (o) => o.trim().toUpperCase() === upper || o.trim() === s.trim()
              );
              ciNum = idx >= 0 ? idx : 0;
            }
          } else if (typeof ciRaw === "object" && ciRaw != null) {
            const letter = pickText(ciRaw.letter ?? ciRaw.key ?? ciRaw.index);
            const s = pickText(ciRaw);
            const upper = (letter || s).trim().toUpperCase();
            const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
            if (letterMap[upper] !== undefined) {
              ciNum = letterMap[upper];
            } else {
              const idx = options.findIndex(
                (o) => o.trim().toUpperCase() === upper || o.trim() === s.trim()
              );
              ciNum = idx >= 0 ? idx : 0;
            }
          } else {
            ciNum = 0;
          }

          questions.push({
            id: Number(q?.id ?? idxA * 1000 + idxQ + 1),
            subject: subj, // Now using the resolved subject title
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
      } else {
        Alert.alert("No Questions", "No diagnostic questions found.");
        router.back();
      }
    } catch (error) {
      console.error("Error loading assessment:", error);
      Alert.alert("Error", "Failed to load assessment questions.");
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
    const storageKey = user?.id
      ? `diagnostic_assessment_results:${user.id}`
      : "diagnostic_assessment_results";
    saveAssessmentResults(
      storageKey,
      score,
      quizData.length,
      subjectScores,
      recommended
    );
    setDiagnosticStatus(true);
    LAST_DIAGNOSTIC_SUBJECT_SCORES = subjectScores;
    setSubjectScores(subjectScores);
    setRecommendedSubjects(recommended);

    try {
      const answers = quizData.map((q, idx) => ({
        question_id: q.id,
        answer:
          userAnswers[idx] != null && q.options[userAnswers[idx] as number] != null
            ? q.options[userAnswers[idx] as number]
            : userAnswers[idx],
        is_correct:
          userAnswers[idx] != null && userAnswers[idx] === q.correctIndex,
      }));
      const timeTaken = INITIAL_TIME_SECONDS - timeLeft;
      const payload = {
        user_id: user?.id,
        assessment_id: "diagnostic",
        subject_id: "diagnostic",
        answers,
        score,
        total_items: quizData.length,
        time_taken_seconds: timeTaken,
      };
      submitDiagnosticSubmission(payload).catch(() => {});
      getDiagnosticRecommendations()
        .then((data) => {
          const rec = Array.isArray(data?.recommendedSubjects)
            ? data.recommendedSubjects
            : [];
          if (rec.length) setRecommendedSubjects(rec.slice(0, 2));
        })
        .catch(() => {});
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
  const recommendWeakSubjects = (
    scores: SubjectScore[],
    count = 2
  ): string[] => {
    const sorted = scores
      .slice()
      .sort((a, b) => a.correct / a.total - b.correct / b.total);
    const n = Math.max(1, Math.min(count, sorted.length));
    return sorted.slice(0, n).map((s) => s.subject);
  };

  // --- RENDER: START SCREEN ---
  if (!isQuizStarted) {
    return (
      <AssessmentStartScreen onStartPress={handleStart} />
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
