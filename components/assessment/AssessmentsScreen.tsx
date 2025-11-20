// app/(tabs)/assessments.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

// --- QUIZ DATA START ---
const QUIZ_DATA = [
  {
    id: 1,
    question:
      'Which of the following describes the psychological field focused on optimizing human behavior in the workplace?',
    options: [
      { id: 'A', text: 'Clinical Psychology' },
      { id: 'B', text: 'Organizational Development' },
      { id: 'C', text: 'Industrial-Organizational Psychology' },
      { id: 'D', text: 'Cognitive Psychology' },
    ],
    answerId: 'C',
  },
  {
    id: 2,
    question:
      "What is the primary goal of the 'Industrial' side of I/O Psychology?",
    options: [
      { id: 'A', text: 'Improving organizational culture and climate' },
      { id: 'B', text: 'Managing conflict resolution and team dynamics' },
      {
        id: 'C',
        text: 'Focusing on personnel issues like selection and training',
      },
      { id: 'D', text: 'Studying consumer behavior and marketing' },
    ],
    answerId: 'C',
  },
  {
    id: 3,
    question:
      "The 'Hawthorne Effect' primarily demonstrated the impact of which factor on worker productivity?",
    options: [
      { id: 'A', text: 'Financial incentives and bonuses' },
      { id: 'B', text: 'The physical conditions of the work environment' },
      { id: 'C', text: 'Attention paid to workers and social factors' },
      { id: 'D', text: 'Automation and technological upgrades' },
    ],
    answerId: 'C',
  },
  {
    id: 4,
    question:
      "Which term refers to the process of gathering and analyzing information about a job's content, context, and human requirements?",
    options: [
      { id: 'A', text: 'Performance Appraisal' },
      { id: 'B', text: 'Job Analysis' },
      { id: 'C', text: 'Recruitment Strategy' },
      { id: 'D', text: 'Ergonomics' },
    ],
    answerId: 'B',
  },
  {
    id: 5,
    question: "What is the main purpose of a '360-degree feedback' system?",
    options: [
      { id: 'A', text: 'To assess customer satisfaction with the product' },
      {
        id: 'B',
        text: "To measure an employee's performance from multiple sources (peers, supervisors, subordinates)",
      },
      { id: 'C', text: 'To review the financial status of the organization' },
      { id: 'D', text: 'To survey employee morale anonymously' },
    ],
    answerId: 'B',
  },
  {
    id: 6,
    question:
      "Which leadership theory emphasizes that a leader's effectiveness is contingent upon the situation?",
    options: [
      { id: 'A', text: 'Great Man Theory' },
      { id: 'B', text: 'Trait Theory' },
      { id: 'C', text: 'Contingency Theory' },
      { id: 'D', text: 'Transactional Leadership' },
    ],
    answerId: 'C',
  },
  {
    id: 7,
    question:
      'A high-scoring employee is promoted based solely on their excellent performance in their current role, despite lacking the necessary managerial skills. This illustrates which cognitive bias?',
    options: [
      { id: 'A', text: 'Recency Bias' },
      { id: 'B', text: 'Confirmation Bias' },
      { id: 'C', text: 'Halo Effect' },
      { id: 'D', text: 'Leniency Error' },
    ],
    answerId: 'C',
  },
  {
    id: 8,
    question:
      "According to Herzberg's Two-Factor Theory, which of the following is considered a 'motivator' rather than a 'hygiene' factor?",
    options: [
      { id: 'A', text: 'Salary and benefits' },
      { id: 'B', text: 'Company policies' },
      { id: 'C', text: 'Working conditions' },
      { id: 'D', text: 'Recognition and achievement' },
    ],
    answerId: 'D',
  },
  {
    id: 9,
    question:
      'What is the term for a systematic approach to teaching workers the skills, knowledge, and abilities necessary to perform their jobs effectively?',
    options: [
      { id: 'A', text: 'Work-Life Balance' },
      { id: 'B', text: 'Human Resources Planning' },
      { id: 'C', text: 'Organizational Culture' },
      { id: 'D', text: 'Training and Development' },
    ],
    answerId: 'D',
  },
  {
    id: 10,
    question:
      'Which theory suggests that employee motivation is tied to their belief that their effort will lead to performance, and that performance will lead to desirable outcomes?',
    options: [
      { id: 'A', text: 'Equity Theory' },
      { id: 'B', text: 'Goal-Setting Theory' },
      { id: 'C', text: 'Expectancy Theory' },
      { id: 'D', text: 'Maslow\'s Hierarchy' },
    ],
    answerId: 'C',
  },
];
// --- QUIZ DATA END ---

// --- COLOR AND FONT CONSTANTS ---
const COLORS = {
  // AssessmentStartScreen Colors
  primaryGreen: '#549454',
  primaryPurple: '#6E3D84',
  // AssessmentScreen Colors
  primary: '#545099',
  primaryBlue: '#104A8E',
  secondaryBeige: '#EAFEFF',
  goldText: '#5C5428',
  borderColor: '#4B3E62',
  shadow: '#000',
  progressBarBackground: '#D0D0D0',

  // Shared Colors
  bodyText: '#555555',
  white: '#FAFFFF',
};

const FONTS = {
  poppinsRegular: 'Poppins-Regular',
  lexendRegular: 'LexendDeca-Regular',
  lexendMedium: 'LexendDeca-Medium',
};

// Initial time in seconds (e.g., 10 minutes * 60 seconds)
const INITIAL_TIME_SECONDS = 600;

// --- PROGRESS BAR COMPONENT ---
interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  // Calculate percentage, ensuring it doesn't exceed 100%
  const progressPercent = Math.min((current / total) * 100, 100);

  return (
    <View style={progressStyles.progressBarContainer}>
      <View
        style={[
          progressStyles.progressBarFill,
          { width: `${progressPercent}%` },
        ]}
      />
    </View>
  );
};

// --- AssessmentStartScreen Component (Initial View) ---
interface AssessmentStartScreenProps {
  onStartPress: () => void;
}

const AssessmentStartScreen: React.FC<AssessmentStartScreenProps> = ({
  onStartPress,
}) => {
  // Load fonts here or pass down the load state if loaded at root
  // For simplicity and adherence to the prompt, we load here
  const [fontsLoaded] = useFonts({
    [FONTS.poppinsRegular]: require('@/assets/fonts/Poppins-Regular.ttf'),
    [FONTS.lexendRegular]: require('@/assets/fonts/LexendDeca-Regular.ttf'),
    [FONTS.lexendMedium]: require('@/assets/fonts/LexendDeca-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={[startStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primaryPurple} />
      </View>
    );
  }

  return (
    <View style={startStyles.container}>
      <Text style={startStyles.title}>
        Let's Get Started{'\n'}with Your Baseline Knowledge
      </Text>

      {/* Placeholder for the image */}
      {/* Assuming '@/assets/images/got_this.png' exists */}
      <View style={startStyles.illustrationContainer}>
        <Text style={{ fontFamily: FONTS.lexendMedium, color: COLORS.primaryPurple }}>
          
        </Text>
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

// --- AssessmentScreen Component (Quiz View) ---
const AssessmentScreen: React.FC = () => {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    [FONTS.poppinsRegular]: require('@/assets/fonts/Poppins-Regular.ttf'),
    [FONTS.lexendRegular]: require('@/assets/fonts/LexendDeca-Regular.ttf'),
    [FONTS.lexendMedium]: require('@/assets/fonts/LexendDeca-Medium.ttf'),
  });

  // --- TIMER STATE & LOGIC ---
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Function to format seconds into MM:SS string
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const submitQuiz = (timedOut = false) => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const message = timedOut
      ? "Your quiz has been automatically submitted."
      : "Your results are being processed.";

    Alert.alert(timedOut ? "Time's Up!" : "Quiz Finished!", message);

    // After submission, maybe navigate to a results screen or back to the start
    // router.push('/results');
  };

  useEffect(() => {
    // Start the countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          submitQuiz(true); // Handle timeout submission
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // --- QUIZ STATE & LOGIC ---
  // Start at question index 0 for a fresh start, not 5 as in the prompt example.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
  const [userAnswers, setUserAnswers] = useState<Record<number, string | null>>(
    {}
  );

  const currentQuestion = QUIZ_DATA[currentQuestionIndex];
  const selectedOption = currentQuestion ? userAnswers[currentQuestion.id] || null : null; // Handle case where currentQuestion is undefined

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return; // Safety check
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUIZ_DATA.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      // Logic for final submission
      submitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer} />;
  }

  if (!currentQuestion) {
      // Should not happen with current logic, but a safety fallback
      return <View style={styles.loadingContainer}><Text>Error loading question data.</Text></View>;
  }

  // Derived properties for display
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === QUIZ_DATA.length - 1;
  const isTimeRunningOut = timeLeft <= 60 && timeLeft > 0;

  // Progress bar values (Note: current is questions COMPLETED, not current index)
  const completedQuestions = currentQuestionIndex + 1;
  const totalQuestions = QUIZ_DATA.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FA" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- Header Section --- */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/')} // navigate to home
            disabled={timeLeft === 0}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Introduction to Industrial and{'\n'}Organizational Psychology
            </Text>
            <Text style={styles.headerSubtitle}>10 Questions</Text>
          </View>
        </View>

        {/* --- PROGRESS BAR --- */}
        <ProgressBar current={completedQuestions} total={totalQuestions} />
        {/* --- END PROGRESS BAR --- */}

        {/* --- Timer Pill --- */}
        <View style={styles.timerContainer}>
          <View
            style={[
              styles.timerPill,
              isTimeRunningOut && styles.timerPillWarning,
              timeLeft === 0 && styles.timerPillDisabled,
            ]}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={
                timeLeft === 0
                  ? '#999'
                  : isTimeRunningOut
                  ? 'red'
                  : '#333'
              }
            />
            <Text
              style={[
                styles.timerText,
                isTimeRunningOut && styles.timerTextWarning,
                timeLeft === 0 && styles.timerTextDisabled,
              ]}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        {/* --- Question Card --- */}
        <View style={styles.questionCard}>
          <Text style={styles.questionCounter}>
            Question {currentQuestionIndex + 1}/{QUIZ_DATA.length}:
          </Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* --- Answer Options --- */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                  timeLeft === 0 && styles.optionButtonDisabled,
                ]}
                onPress={() => handleSelectOption(option.id)}
                activeOpacity={0.8}
                disabled={timeLeft === 0}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                    timeLeft === 0 && styles.optionTextDisabled,
                  ]}
                >
                  {option.id}. {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- Navigation Footer --- */}
        <View style={styles.footer}>
          {/* Previous Button (Disabled on the first question or if time is 0) */}
          <TouchableOpacity
            style={[
              styles.navButton,
              (isFirstQuestion || timeLeft === 0) && styles.navButtonDisabled,
            ]}
            onPress={handlePrev}
            disabled={isFirstQuestion || timeLeft === 0}
          >
            <Text
              style={[
                styles.navButtonText,
                (isFirstQuestion || timeLeft === 0) &&
                  styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {/* Next Button (Text changes to 'Submit' on the last question, disabled if time is 0) */}
          <TouchableOpacity
            style={[
              styles.navButton,
              timeLeft === 0 && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={timeLeft === 0}
          >
            <Text
              style={[
                styles.navButtonText,
                timeLeft === 0 && styles.navButtonTextDisabled,
              ]}
            >
              {isLastQuestion ? 'Submit' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- MAIN EXPORT COMPONENT ---
export default function AssessmentsScreen() {
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const handleStartPress = () => {
    setIsQuizStarted(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isQuizStarted ? (
        <AssessmentScreen />
      ) : (
        <AssessmentStartScreen onStartPress={handleStartPress} />
      )}
    </SafeAreaView>
  );
}

// --- STYLES ---

// AssessmentStartScreen Styles
const startStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  illustrationContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F0F0F0', // Visual aid for where the image would be
    borderRadius: 8,
  },
  title: {
    fontFamily: FONTS.lexendMedium,
    fontSize: 28,
    color: COLORS.primaryGreen,
    textAlign: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontFamily: FONTS.lexendMedium,
    fontSize: 22,
    color: COLORS.primaryPurple,
    marginBottom: 16,
  },
  description: {
    fontFamily: FONTS.poppinsRegular,
    fontSize: 16,
    color: COLORS.bodyText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primaryPurple,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    fontFamily: FONTS.lexendMedium,
    color: COLORS.white,
    fontSize: 18,
  },
});

// Progress Bar Styles
const progressStyles = StyleSheet.create({
  progressBarContainer: {
    height: 10,
    width: '95%',
    backgroundColor: COLORS.progressBarBackground, // Light grey background
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden', // Important to keep the fill within the bounds
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#AAAAAA',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryBlue, // Primary blue color for progress
    borderRadius: 5,
  },
});

// AssessmentScreen (Quiz) Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FA', // Light bluish-white background from screenshot
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    zIndex: 10,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: -20,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.lexendMedium,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    lineHeight: 20,
  },
  headerSubtitle: {
    fontFamily: FONTS.lexendRegular,
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // Timer Styles
  timerContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#555',
  },
  timerPillWarning: {
    borderColor: 'red',
    backgroundColor: '#FFE5E5', // Light red background for warning
  },
  timerPillDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#999',
  },
  timerText: {
    fontFamily: FONTS.lexendMedium,
    fontSize: 14,
    marginLeft: 6,
    color: '#333',
  },
  timerTextWarning: {
    color: 'red',
  },
  timerTextDisabled: {
    color: '#999',
  },

  // Question Card Styles
  questionCard: {
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 12,
    padding: 25,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 200,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  questionCounter: {
    fontFamily: FONTS.lexendRegular,
    fontSize: 14,
    color: '#333',
    position: 'absolute',
    top: 20,
    left: 20,
  },
  questionText: {
    fontFamily: FONTS.lexendMedium,
    fontSize: 16,
    color: COLORS.goldText,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
  },

  // Option Button Styles
  optionsContainer: {
    gap: 15,
    marginBottom: 40,
    marginHorizontal: 10,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4B3E62',
    // Shadow for iOS
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonDisabled: {
    backgroundColor: '#EEEEEE',
    borderColor: '#AAAAAA',
  },
  optionText: {
    fontFamily: FONTS.lexendRegular,
    fontSize: 15,
    color: COLORS.goldText,
  },
  optionTextSelected: {
    color: COLORS.white,
  },
  optionTextDisabled: {
    color: '#999999',
  },

  // Footer / Navigation Styles (with new disabled styles)
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 50,
    marginHorizontal: 10,
  },
  navButton: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#99AABB', // A lighter blue/grey for disabled state
  },
  navButtonText: {
    fontFamily: FONTS.lexendRegular,
    color: COLORS.white,
    fontSize: 16,
  },
  navButtonTextDisabled: {
    color: '#DDDDDD',
  },
});