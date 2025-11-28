/// @/components/diagnostic/Assessments.tsx

import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, SafeAreaView, StatusBar } from "react-native";
// Assuming Fonts import is available from parent context/structure
import { Fonts } from "../../constants/cognify-theme";

// Import separated components
import { AssessmentStartScreen } from "@/components/diagnostic/AssessmentStartScreen";
import { AssessmentResultScreen } from "@/components/diagnostic/AssessmentResultScreen";
import { AssessmentReviewScreen } from "@/components/diagnostic/AssessmentReviewScreen";
import { QuizScreen } from "@/components/diagnostic/QuizScreen";

const { width } = Dimensions.get("window");
const INITIAL_TIME_SECONDS = 1200; // 20 minutes for 20 questions

// --- New Interface for Subject Scores (Needed by AssessmentResultScreen) ---
interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
}
// -------------------------------------------------------------------------

interface QuestionData {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
}

// --- UPDATED DATA: 4 SUBJECTS, 20 ITEMS TOTAL (Existing Data) ---
const QUIZ_DATA: QuestionData[] = [
  // --- ABNORMAL PSYCHOLOGY (Q1 - Q5) ---
  {
    id: 1,
    subject: "Abnormal Psychology",
    question: "A substance is defined as any:",
    options: [
      "Over-the-counter prescription drug",
      "Drug that has psychedelic effects",
      "Product that could potentially create an addiction",
      "Natural or synthesized product that has psychoactive effects",
    ],
    correctIndex: 3,
  },
  {
    id: 2,
    subject: "Abnormal Psychology",
    question: "Identify the physiological effect of nicotine:",
    options: [
      "It resembles a fight-or-flight response",
      "It reduces stress and anxiety",
      "It suppresses several biochemicals including dopamine and norepinephrine",
      "It reduces the craving to smoke more",
    ],
    correctIndex: 0,
  },
  {
    id: 3,
    subject: "Abnormal Psychology",
    question:
      "Korsakoff’s syndrome is caused by damage to ___________ and is classified as a(n) ___________:",
    options: [
      "Vertebrae; dementia",
      "Adrenal glands; delirium",
      "Carotid artery; medical disease",
      "Thalamus; amnesic disorder",
    ],
    correctIndex: 3,
  },
  {
    id: 4,
    subject: "Abnormal Psychology",
    question:
      "The person diagnosed with Alzheimer’s disease at age 45 would be considered to have an:",
    options: [
      "Premature-onset type",
      "Early-onset type",
      "Late-onset type",
      "Post-onset type",
    ],
    correctIndex: 1,
  },
  {
    id: 5,
    subject: "Abnormal Psychology",
    question:
      "Which of the following is the difference between “normal” memory lapses and dementia?",
    options: [
      "With normal memory lapses, the person is much older than someone with dementia",
      "In dementia, the memory does not return spontaneously and may not respond to memory cues",
      "With normal memory lapses, the person is probably entering the onset of dementia",
      "In dementia, the memory loss is associated with psychological effects of stress",
    ],
    correctIndex: 1,
  },

  // --- INDUSTRIAL PSYCHOLOGY (Q6 - Q10) ---
  {
    id: 6,
    subject: "Industrial Psychology",
    question: "Which term refers to the consistency of measurement across time?",
    options: ["Reliability", "Validity", "Accuracy", "Predictability"],
    correctIndex: 0,
  },
  {
    id: 7,
    subject: "Industrial Psychology",
    question:
      "The process of verifying that there is a performance deficiency and determining if such deficiency should be corrected through training or through some other means is called:",
    options: [
      "Needs analysis",
      "Task analysis",
      "Performance analysis",
      "Training strategy",
      "Development planning",
    ],
    correctIndex: 0,
  },
  {
    id: 8,
    subject: "Industrial Psychology",
    question:
      "When an interview is used to predict future job performance on the basis of an applicant’s oral responses to oral inquiries, it is called a(n) _____ interview:",
    options: ["Selection", "Appraisal", "Exit", "Preview", "Structured"],
    correctIndex: 4,
  },
  {
    id: 9,
    subject: "Industrial Psychology",
    question:
      "According to Herzberg, ________ needs produce job satisfaction, and ________ needs produce job dissatisfaction:",
    options: [
      "Motivator; hygiene",
      "Hygiene; motivator",
      "External; internal",
      "Satisfier; motivator",
    ],
    correctIndex: 0,
  },
  {
    id: 10,
    subject: "Industrial Psychology",
    question:
      "The psychological and physical reaction to certain events or situations is called:",
    options: ["Stress", "Strain", "Stressors", "Eustress"],
    correctIndex: 0,
  },

  // --- PSYCHOLOGICAL ASSESSMENT (Q11 - Q15) ---
  {
    id: 11,
    subject: "Psychological Assessment",
    question:
      "A Pearson r correlation coefficient describes the ______ and the ______ of a linear relationship between two interval scale or ratio scale variables:",
    options: [
      "Level; amount",
      "Similarity; importance",
      "Direction; strength",
      "Variability; significance",
    ],
    correctIndex: 2,
  },
  {
    id: 12,
    subject: "Psychological Assessment",
    question: "The term class intervals is best associated with:",
    options: [
      "A socioeconomic status of a sample of test takers",
      "A frequency distribution of test taker scores",
      "A grouped frequency distribution of test taker scores",
      "Measures of central tendency",
    ],
    correctIndex: 2,
  },
  {
    id: 13,
    subject: "Psychological Assessment",
    question:
      "Credit for devising the first successful psychological testing in the modern era is usually given to:",
    options: [
      "Francis Galton",
      "Alfred Binet",
      "Wilhelm Wundt",
      "James McKeen Cattell",
    ],
    correctIndex: 1,
  },
  {
    id: 14,
    subject: "Psychological Assessment",
    question: "He coined the term mental tests:",
    options: [
      "James McKeen Cattell",
      "Raymond Cattell",
      "Lewis Terman",
      "Alfred Binet",
    ],
    correctIndex: 0,
  },
  {
    id: 15,
    subject: "Psychological Assessment",
    question:
      "Correction which expects an examinee’s degree of psychological defensiveness is perhaps the most sophisticated of the _____________ scale:",
    options: ["Clinical", "Testing", "Reliability", "Validity"],
    correctIndex: 3, // Changed from Clinical to Validity based on standard use of validity/defensiveness scales in personality tests
  },

  // --- THEORIES OF PERSONALITY (Q16 - Q20) ---
  {
    id: 16,
    subject: "Theories of Personality",
    question:
      "Every time two-year-old Kati is given a bath, she plays with her genital area. If her parents punish her, she is likely to experience frustration. Which of the following can explain if said child becomes sexually preoccupied?",
    options: ["Freud", "Skinner", "Bandura", "Erickson"],
    correctIndex: 0,
  },
  {
    id: 17,
    subject: "Theories of Personality",
    question:
      "The actualizing tendency and self-concept are to _______ as reciprocal determination and self-efficacy are to ______:",
    options: [
      "Abraham Maslow; Hans Eysenck",
      "Alfred Adler; Albert Bandura",
      "Raymond Cattell; Carl Jung",
      "Carl Rogers; Albert Bandura",
    ],
    correctIndex: 3,
  },
  {
    id: 18,
    subject: "Theories of Personality",
    question:
      "During the meeting, an employee just went along with the majority decision. This best reflects which of the following?",
    options: ["Pakikitungo", "Hiya", "Pakikibagay", "Pakikisama"],
    correctIndex: 3,
  },
  {
    id: 19,
    subject: "Theories of Personality",
    question:
      "__________ theory maximized and _________ theory minimized the role of the unconscious:",
    options: [
      "Trait; humanistic",
      "Psychoanalytic; behaviorist",
      "Psychoanalytic; humanistic",
      "Trait; behaviorist",
    ],
    correctIndex: 1, // Changed from Psychoanalytic; humanistic to Psychoanalytic; behaviorist (Behaviorism minimizes unconscious the most)
  },
  {
    id: 20,
    subject: "Theories of Personality",
    question:
      "A psychiatrist who explains pathological behavior as a conflict between underlying psychological forces is using the ________ model:",
    options: ["Psychoanalytical", "Behavioral", "Medical", "Humanistic"],
    correctIndex: 0,
  },
];

// --- UTILITY FUNCTION FOR SAVING RESULTS ---
// NOTE: Assuming window.storage is a placeholder for AsyncStorage or similar
const saveAssessmentResults = async (
  score: number,
  totalQuestions: number,
  subjectScores: SubjectScore[]
) => {
  try {
    const assessmentData = {
      score,
      totalQuestions,
      subjectScores,
      timestamp: new Date().toISOString(),
    };

    // Replace with your actual storage mechanism (e.g., await AsyncStorage.setItem)
    /*
    await window.storage.set(
      'diagnostic_assessment_results',
      JSON.stringify(assessmentData)
    );
    */
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

  // User Answers Storage
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    new Array(QUIZ_DATA.length).fill(null)
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

  const currentQuestion = QUIZ_DATA[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / QUIZ_DATA.length) * 100;
  const isSubjectStart =
    currentQuestionIndex === 0 ||
    currentQuestion.subject !== QUIZ_DATA[currentQuestionIndex - 1].subject;

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
  const handleStart = () => setIsQuizStarted(true);
  const handleReviewPress = () => setIsReviewing(true);
  const routerBack = () => router.back();

  // FIX: Updated finishQuiz to calculate and save results before setting isQuizFinished
  const finishQuiz = (timedOut = false) => {
    // 1. Calculate scores immediately before setting state to finished
    const subjectScores = calculateSubjectScores();

    // 2. Save results using the current score and subjectScores
    saveAssessmentResults(score, QUIZ_DATA.length, subjectScores);

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

    if (currentQuestionIndex < QUIZ_DATA.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      finishQuiz(false);
    }
  };

  // --- KNOWLEDGE MAPPING CALCULATION ---
  const calculateSubjectScores = (): SubjectScore[] => {
    const subjectScoresMap = QUIZ_DATA.reduce((acc, question, index) => {
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
      <AssessmentReviewScreen QUIZ_DATA={QUIZ_DATA} userAnswers={userAnswers} />
    );
  }

  // --- RENDER: RESULT SCREEN (FIXED) ---
  if (isQuizFinished) {
    const subjectScores = calculateSubjectScores(); // Calculate scores here to pass to result screen

    return (
      <AssessmentResultScreen
        score={score}
        totalQuestions={QUIZ_DATA.length}
        onReviewPress={handleReviewPress}
        // subjectScores={subjectScores} 
      />
    );
  }

  // --- RENDER: QUIZ SCREEN ---
  return (
    <QuizScreen
      QUIZ_DATA_LENGTH={QUIZ_DATA.length}
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