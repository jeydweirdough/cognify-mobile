import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Fonts } from '../../constants/cognify-theme';

const { width } = Dimensions.get('window');
const INITIAL_TIME_SECONDS = 600; // 10 minutes

// --- UPDATED DATA: PSYCHOLOGY QUESTIONS ---
const QUIZ_DATA = [
  {
    id: 1,
    question: 'Which of the following best defines the primary focus of Industrial-Organizational (I/O) Psychology?',
    options: [
      'Diagnosing and treating mental disorders',
      'The scientific study of human behavior in the workplace',
      'Understanding the development of children',
      'Analyzing the anatomy of the brain'
    ],
    correctIndex: 1, // Behavior in workplace
  },
  {
    id: 2,
    question: "The 'Hawthorne Effect' suggests that employees perform better when:",
    options: [
      'They are paid higher wages',
      'The lighting in the room is increased',
      'They know they are being observed or receive attention',
      'They work in isolation'
    ],
    correctIndex: 2, // Observed/Attention
  },
  {
    id: 3,
    question: "In the context of Job Analysis, what does the acronym KSAO stand for?",
    options: [
      'Knowledge, Skills, Abilities, and Other characteristics',
      'Key Systems, Analysis, and Objectives',
      'Knowledge, Strategy, Action, and Organization',
      'Key Skills, Aptitude, and Operations'
    ],
    correctIndex: 0, // Knowledge, Skills...
  },
  {
    id: 4,
    question: "Which theory of motivation suggests that human needs are arranged in a hierarchy, starting with physiological needs?",
    options: [
      "Herzberg's Two-Factor Theory",
      "Vroom's Expectancy Theory",
      "Maslow's Hierarchy of Needs",
      "Adams' Equity Theory"
    ],
    correctIndex: 2, // Maslow
  },
  {
    id: 5,
    question: "Which leadership style is characterized by the leader making all decisions with little to no input from the team?",
    options: [
      'Transformational Leadership',
      'Democratic Leadership',
      'Laissez-faire Leadership',
      'Autocratic Leadership'
    ],
    correctIndex: 3, // Autocratic
  },
];

// --- START SCREEN ---
const AssessmentStartScreen = ({ onStartPress }: { onStartPress: () => void }) => {
  return (
    <View style={startStyles.container}>
      <Text style={startStyles.title}>
        Let's Get Started{'\n'}with Your Baseline Knowledge
      </Text>
      <View style={startStyles.illustrationContainer}>
        <Image
          source={require('@/assets/images/got_this.png')}
          style={{ width: 140, height: 140, resizeMode: 'contain' }}
        />
      </View>
      <Text style={startStyles.subtitle}>You got this!</Text>
      <Text style={startStyles.description}>
        This quick assessment helps us understand your current strengths and
        learning needs. Your results will guide your personalized study plan.
      </Text>
      <TouchableOpacity style={startStyles.button} onPress={onStartPress}>
        <Text style={startStyles.buttonText}>START NOW!</Text>
      </TouchableOpacity>
    </View>
  );
};

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

  // User Answers Storage
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(QUIZ_DATA.length).fill(null));

  // Timer State
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- THEME COLORS ---
  const themeColors = {
    background: isDarkMode ? '#121212' : '#F8F9FA',
    textPrimary: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
    cardBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    optionBorder: isDarkMode ? '#333333' : '#E0E0E0',
    optionSelectedBg: '#381E72',
    questionCardBg: '#EAFEFF',
    questionCardText: '#5C5428',
    questionCardBorder: '#4B3E62',
  };

  const currentQuestion = QUIZ_DATA[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / QUIZ_DATA.length) * 100;

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
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isQuizStarted, isQuizFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- HANDLERS ---
  const handleStart = () => setIsQuizStarted(true);

  const handleNext = () => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = selectedOptionIndex;
    setUserAnswers(updatedAnswers);

    if (selectedOptionIndex === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }

    if (currentQuestionIndex < QUIZ_DATA.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      finishQuiz(false);
    }
  };

  const finishQuiz = (timedOut = false) => {
    setIsQuizFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (timedOut) Alert.alert("Time's Up!", "Your assessment was submitted automatically.");
  };

  // --- RENDER: START SCREEN ---
  if (!isQuizStarted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" />
        <AssessmentStartScreen onStartPress={handleStart} />
      </SafeAreaView>
    );
  }

  // --- RENDER: REVIEW SCREEN (UPDATED HEADER) ---
  if (isReviewing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <StatusBar barStyle="dark-content" />

        {/* Review Header - Updated */}
        <View style={styles.reviewHeader}>

          {/* Back To Home Button (Arrow + Text) */}
          <Pressable
            style={styles.reviewBackButton}
            onPress={() => router.push('/')} // Navigate to Home
          >
            <Ionicons name="arrow-back" size={20} color="#381E72" />
            <Text style={styles.reviewBackText}>Back to Home</Text>
          </Pressable>

          <View style={styles.reviewTitleContainer}>
            <Text style={styles.reviewHeaderTitle} numberOfLines={2}>
              Introduction to Industrial and Organizational Psychology
            </Text>
            <Text style={styles.reviewHeaderSubtitle}>Review Answers</Text>
          </View>

        </View>

        <ScrollView contentContainerStyle={styles.reviewScrollContent}>
          {QUIZ_DATA.map((question, index) => {
            const userAnswerIndex = userAnswers[index];
            const isCorrect = userAnswerIndex === question.correctIndex;

            return (
              <View key={question.id} style={styles.reviewQuestionContainer}>
                <View style={styles.reviewQuestionLabelContainer}>
                  <Text style={styles.reviewQuestionLabel}>Question {index + 1}</Text>
                  <View style={styles.reviewUnderline} />
                </View>
                <Text style={styles.reviewQuestionText}>{question.question}</Text>

                {!isCorrect && userAnswerIndex !== null && (
                  <View style={styles.reviewAnswerRow}>
                    <Ionicons name="close-circle" size={24} color="#FF5252" />
                    <Text style={[styles.reviewAnswerText, { color: '#FF5252' }]}>
                      {question.options[userAnswerIndex]}
                    </Text>
                  </View>
                )}

                <View style={styles.reviewAnswerRow}>
                  <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                  <Text style={[styles.reviewAnswerText, { color: '#2E7D32' }]}>
                    {question.options[question.correctIndex]}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- RENDER: RESULT SCREEN ---
  if (isQuizFinished) {
    const finalScore = selectedOptionIndex === currentQuestion.correctIndex ? score + 1 : score;
    const passed = finalScore >= (QUIZ_DATA.length / 2); // 50% passing

    // Dynamic variables for Pass vs Fail
    const titleText = passed ? "Excellent!" : "Keep Trying!";
    const titleColor = passed ? "#4CAF50" : "#E53935"; // Green vs Red
    const iconName = passed ? "happy" : "sad";
    const iconColor = passed ? "#FFC107" : "#BDBDBD"; // Gold vs Grey
    const starColor = passed ? "#FFC107" : "#E0E0E0"; // Gold vs Light Grey

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.resultContainer}>

          <Text style={[styles.resultTitleText, { color: titleColor }]}>
            {titleText}
          </Text>

          <View style={styles.smileyContainer}>
            <Ionicons name={iconName} size={100} color={iconColor} />
          </View>

          <View style={styles.starsRow}>
            <Ionicons name="star" size={32} color={starColor} style={styles.starSide} />
            <Ionicons name="star" size={42} color={starColor} style={styles.starCenter} />
            <Ionicons name="star" size={32} color={starColor} style={styles.starSide} />
          </View>

          <Text style={styles.mockText}>Mock # 1</Text>

          <Text style={[styles.passedText, { color: passed ? '#6E3D84' : '#D32F2F' }]}>
            {passed ? "Exam Passed !" : "Exam Failed"}
          </Text>

          <Text style={styles.scoreDescription}>
            You answered {finalScore} out of {QUIZ_DATA.length} questions correctly.
          </Text>

          <Pressable
            style={styles.reviewButton}
            onPress={() => setIsReviewing(true)}
          >
            <Text style={styles.reviewButtonText}>Review Answers</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDER: QUIZ SCREEN ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => Alert.alert("Exit?", "Progress will be lost", [{ text: "Cancel" }, { text: "Exit", onPress: () => router.back() }])}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          Assessment
        </Text>
        <Pressable style={styles.iconButton} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Feather name={isDarkMode ? "sun" : "moon"} size={24} color={themeColors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.fixedTopContainer}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <View style={styles.timerContainer}>
          <View style={[styles.timerPill, { backgroundColor: themeColors.cardBg, borderColor: themeColors.optionBorder }]}>
            <Ionicons name="time-outline" size={16} color={timeLeft < 60 ? "red" : themeColors.textSecondary} />
            <Text style={[styles.timerText, { color: timeLeft < 60 ? "red" : themeColors.textPrimary }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.questionCard,
          {
            backgroundColor: themeColors.questionCardBg,
            borderColor: themeColors.questionCardBorder
          }
        ]}>
          <Text style={[styles.questionCounter, { color: '#333' }]}>
            Question {currentQuestionIndex + 1}
          </Text>
          <Text style={[styles.questionText, { color: themeColors.questionCardText }]}>
            {currentQuestion.question}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOptionIndex === index;
            return (
              <Pressable
                key={index}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? themeColors.optionSelectedBg : themeColors.cardBg,
                    borderColor: isSelected ? themeColors.optionSelectedBg : themeColors.optionBorder,
                  }
                ]}
                onPress={() => setSelectedOptionIndex(index)}
              >
                <View style={[
                  styles.radioCircle,
                  { borderColor: isSelected ? '#FFF' : themeColors.textSecondary }
                ]}>
                  {isSelected && <View style={styles.radioFill} />}
                </View>
                <Text style={[
                  styles.optionText,
                  { color: isSelected ? '#FFF' : themeColors.textPrimary }
                ]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: themeColors.background }]}>
        <Pressable
          style={[
            styles.primaryButton,
            selectedOptionIndex === null && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selectedOptionIndex === null}
        >
          <Text style={styles.primaryButtonText}>
            {currentQuestionIndex === QUIZ_DATA.length - 1 ? "Submit Assessment" : "Next Question"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

// --- STYLES ---
const startStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: '#4CAF50',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 30,
  },
  illustrationContainer: { marginBottom: 30, alignItems: 'center', justifyContent: 'center' },
  subtitle: {
    fontFamily: Fonts.bold, fontSize: 22, color: '#6E3D84', marginBottom: 12, textAlign: 'center',
  },
  description: {
    fontFamily: Fonts.regular, fontSize: 15, color: '#333333', textAlign: 'center', marginBottom: 50, lineHeight: 22,
  },
  button: {
    backgroundColor: '#6E3D84', paddingVertical: 16, width: '100%', borderRadius: 30, alignItems: 'center',
    shadowColor: '#6E3D84', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6,
  },
  buttonText: {
    fontFamily: Fonts.bold, color: '#FFFFFF', fontSize: 16, letterSpacing: 1,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#381E72', justifyContent: 'center', alignItems: 'center',
  },
  iconButton: { padding: 8 },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18 },
  fixedTopContainer: { paddingBottom: 10 },
  progressContainer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 10 },
  progressBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#381E72', borderRadius: 4 },
  timerContainer: { alignItems: 'center', marginBottom: 5 },
  timerPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, gap: 6 },
  timerText: { fontFamily: Fonts.semiBold, fontSize: 14 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  questionCard: {
    borderRadius: 12, padding: 25, marginBottom: 30, borderWidth: 1, minHeight: 180, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  questionCounter: { position: 'absolute', top: 16, left: 20, fontFamily: Fonts.regular, fontSize: 12, opacity: 0.7 },
  questionText: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 28, textAlign: 'center', marginTop: 10 },
  optionsContainer: { gap: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
  optionText: { fontFamily: Fonts.regular, fontSize: 16, flex: 1 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' },
  footer: { padding: 24, position: 'absolute', bottom: 0, left: 0, right: 0 },
  primaryButton: {
    backgroundColor: '#381E72', paddingVertical: 16, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#381E72', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  disabledButton: { backgroundColor: '#B0B0B0', shadowOpacity: 0, elevation: 0 },
  primaryButtonText: { color: '#FFF', fontFamily: Fonts.bold, fontSize: 16 },

  // --- RESULT STYLES ---
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  resultTitleText: { fontFamily: Fonts.bold, fontSize: 32, marginBottom: 24 },
  smileyContainer: { marginBottom: 20 },
  starsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 20 },
  starSide: { marginBottom: 5 },
  starCenter: { marginHorizontal: 8, marginBottom: 10 },
  mockText: { fontFamily: Fonts.semiBold, fontSize: 16, color: '#000', marginTop: 10 },
  passedText: { fontFamily: Fonts.bold, fontSize: 22, marginVertical: 8 },
  scoreDescription: { fontFamily: Fonts.regular, fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
  reviewButton: {
    backgroundColor: '#6E3D84', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, shadowColor: '#6E3D84', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  reviewButtonText: { color: '#FFF', fontFamily: Fonts.bold, fontSize: 16 },

  // --- REVIEW SCREEN STYLES ---
  reviewHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  reviewBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewBackText: {
    color: '#381E72',
    fontFamily: Fonts.bold,
    fontSize: 16,
    marginLeft: 8,
  },
  reviewTitleContainer: {
    width: '100%',
    alignItems: 'center',
  },
  reviewHeaderTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  reviewHeaderSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  reviewScrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  reviewQuestionContainer: {
    marginBottom: 30,
  },
  reviewQuestionLabelContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  reviewQuestionLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#7C7255',
  },
  reviewUnderline: {
    height: 1,
    backgroundColor: '#C5A900',
    width: '100%',
    marginTop: 2,
  },
  reviewQuestionText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#423815',
    lineHeight: 22,
    marginBottom: 15,
  },
  reviewAnswerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  reviewAnswerText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    marginTop: 2,
  },
});