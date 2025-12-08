import { AssessmentResultScreen } from "@/components/diagnostic/AssessmentResultScreen";
import { AssessmentReviewScreen } from "@/components/diagnostic/AssessmentReviewScreen";
import { AssessmentStartScreen } from "@/components/diagnostic/AssessmentStartScreen";
import { QuizScreen } from "@/components/diagnostic/QuizScreen";
import { useAuth } from "@/lib/auth";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, View } from "react-native";
import {
  analyzeReadiness,
  getDiagnosticAssessmentQuestions,
  hasTakenDiagnostic,
  setDiagnosticStatus,
  submitAssessmentSubmission
} from "../../lib/api";
import { storage } from "../../lib/storage";

const { width } = Dimensions.get("window");
const INITIAL_TIME_SECONDS = 1200; 

// --- TYPES ---
interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
}

interface QuestionData {
  id: string | number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  // [FIX] Track origin assessment to submit correctly later
  assessmentId: string;
  subjectId: string; 
}

const saveAssessmentResults = async (storageKey: string, score: number, total: number, subjectScores: SubjectScore[], recommended: string[]) => {
  try {
    const data = { score, total, subjectScores, timestamp: new Date().toISOString(), recommended };
    await storage.setItem(storageKey, JSON.stringify(data));
  } catch (e) { console.error(e); }
};

export default function AssessmentsScreen() {
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_SECONDS);
  const timerRef = useRef<number | null>(null);

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
  const progressPercent = quizData.length > 0 ? ((currentQuestionIndex + 1) / quizData.length) * 100 : 0;
  
  const isSubjectStart = currentQuestionIndex === 0 || (currentQuestion && quizData[currentQuestionIndex - 1] && currentQuestion.subject !== quizData[currentQuestionIndex - 1].subject);

  useEffect(() => {
    if (isQuizStarted && !isQuizFinished) {
      timerRef.current = setInterval(() => setTimeLeft(p => (p <= 1 ? (finishQuiz(true), 0) : p - 1)), 1000) as unknown as number;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isQuizStarted, isQuizFinished]);

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  const handleStart = async () => {
    try {
      setLoading(true);
      if (await hasTakenDiagnostic()) {
        Alert.alert("Completed", "You have already completed the diagnostic.");
        router.back();
        return;
      }

      // [FIX] Fetch ALL diagnostic type assessments (which now means 4 separate ones)
      const assessments: any[] = await getDiagnosticAssessmentQuestions();
      const diagnostics = assessments.filter(a => String(a.type).includes('diagnostic'));
      const processed: QuestionData[] = [];

      diagnostics.forEach(ass => {
        const sName = ass.subject?.title || ass.title.replace("Diagnostic - ", "") || "General";
        const sId = ass.subject_id;
        
        (ass.questions || []).forEach((q: any, idx: number) => {
            const opts = q.choices || q.options || [];
            const correct = q.correct_answers || q.answer;
            let cIdx = 0;
            if (typeof correct === 'string') {
                cIdx = opts.findIndex((o: string) => o === correct);
                if (cIdx === -1) cIdx = 0;
            }

            processed.push({
                id: q.question_id || idx,
                subject: sName,
                question: q.text || q.question,
                options: opts,
                correctIndex: cIdx,
                assessmentId: ass.id, // [FIX] Track origin
                subjectId: sId        // [FIX] Track subject
            });
        });
      });

      if (processed.length) {
        setQuizData(processed);
        setUserAnswers(new Array(processed.length).fill(null));
        setIsQuizStarted(true);
      } else {
        Alert.alert("Error", "No diagnostic questions found.");
        router.back();
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to start.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewPress = () => setIsReviewing(true);
  const routerBack = () => router.back();

  const finishQuiz = async (timedOut = false) => {
    const scores = calculateSubjectScores();
    const recommended = scores.sort((a,b) => (a.correct/a.total)-(b.correct/b.total)).slice(0,2).map(s=>s.subject);
    
    // Save Locally
    const key = user?.id ? `diagnostic_assessment_results:${user.id}` : "diagnostic_assessment_results";
    saveAssessmentResults(key, score, quizData.length, scores, recommended);
    setDiagnosticStatus(true);
    setSubjectScores(scores);
    setRecommendedSubjects(recommended);

    // [FIX] Submit Results Individually per Assessment ID
    if (user?.id) {
        // Group answers by assessment ID
        const groupedAnswers: Record<string, any[]> = {};
        
        quizData.forEach((q, i) => {
            if (!groupedAnswers[q.assessmentId]) groupedAnswers[q.assessmentId] = [];
            groupedAnswers[q.assessmentId].push({
                question_id: q.id,
                answer: userAnswers[i] !== null ? q.options[userAnswers[i] as number] : null,
                is_correct: userAnswers[i] === q.correctIndex
            });
        });

        // Submit each group
        for (const assId of Object.keys(groupedAnswers)) {
            const answers = groupedAnswers[assId];
            const correctCount = answers.filter(a => a.is_correct).length;
            const targetQ = quizData.find(q => q.assessmentId === assId);
            
            await submitAssessmentSubmission({
                user_id: user.id,
                assessment_id: assId,
                subject_id: targetQ?.subjectId || "global", // [FIX] Links to REAL Subject
                answers: answers,
                score: correctCount,
                total_items: answers.length,
            }).catch(e => console.log("Sub fail", e));
        }
        
        await analyzeReadiness(user.id);
    }

    setIsQuizFinished(true);
    if (timedOut) Alert.alert("Time's Up!", "Submitted.");
  };

  const handleNext = () => {
    const next = [...userAnswers];
    next[currentQuestionIndex] = selectedOptionIndex;
    setUserAnswers(next);
    if (selectedOptionIndex === currentQuestion.correctIndex) setScore(s => s + 1);
    if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedOptionIndex(null);
    } else {
        finishQuiz();
    }
  };

  const calculateSubjectScores = () => {
    const map: Record<string, SubjectScore> = {};
    quizData.forEach((q, i) => {
        if (!map[q.subject]) map[q.subject] = { subject: q.subject, correct: 0, total: 0 };
        map[q.subject].total++;
        if (userAnswers[i] === q.correctIndex) map[q.subject].correct++;
    });
    return Object.values(map);
  };

  if (loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#381E72"/></View>;
  if (!isQuizStarted) return <AssessmentStartScreen onStartPress={handleStart} />;
  if (isReviewing) return <AssessmentReviewScreen QUIZ_DATA={quizData} userAnswers={userAnswers} />;
  if (isQuizFinished) return <AssessmentResultScreen score={score} totalQuestions={quizData.length} onReviewPress={handleReviewPress} recommendedSubjects={recommendedSubjects} subjectScores={subjectScores} />;

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