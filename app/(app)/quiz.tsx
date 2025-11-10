import { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import { api } from '../../lib/api';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import type { GeneratedQuiz, GeneratedQuestion } from '../../lib/types';
// --- FIX: Import useAuth to get user ID ---
import { useAuth } from '../../lib/auth';

export default function QuizScreen() {
  const { quizId, moduleId } = useLocalSearchParams<{ quizId: string; moduleId: string }>();
  // --- FIX: Get user from auth context ---
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      // --- FIX: Fetch the quiz directly by its ID ---
      const { data } = await api.get<GeneratedQuiz>(`/generate/generated_quizzes/${quizId}`);
      setQuiz(data);
      // --- END FIX ---
    } catch (error: any) {
      console.error('Failed to fetch quiz:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answer,
    });
  };

  const handleNext = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished all questions
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return; // --- FIX: Check for user ---

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctCount++;
      }
    });

    const score = (correctCount / quiz.questions.length) * 100;
    
    try {
      // Log activity to backend
      // --- FIX: Add the user's ID to the payload ---
      await api.post('/activities/', {
        user_id: user.id, // <-- This is the fix
        subject_id: quiz.subject_id,
        activity_type: 'quiz',
        activity_ref: quiz.id,
        bloom_level: quiz.aligned_bloom_level,
        score: score,
        completion_rate: 1.0,
        duration: 0, // You could track actual duration
        timestamp: new Date().toISOString(),
      });
      // --- END FIX ---
    } catch (error: any) {
      console.error('Failed to log activity:', error.response?.data || error.message);
    }

    setShowResults(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Quiz' }} />
        <View style={styles.centered}>
          <FontAwesome name="exclamation-circle" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>Quiz not available</Text>
        </View>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  if (showResults) {
    const correctCount = quiz.questions.filter(
      (q, index) => selectedAnswers[index] === q.answer
    ).length;
    const score = (correctCount / quiz.questions.length) * 100;
    const isPassing = score >= 75;

    return (
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: 'Quiz Results' }} />
        <View style={styles.content}>
          <View style={styles.resultsCard}>
            <FontAwesome
              name={isPassing ? 'check-circle' : 'times-circle'}
              size={64}
              color={isPassing ? '#4CAF50' : '#FF9800'}
            />
            <Text style={styles.resultsTitle}>
              {isPassing ? 'Great Job!' : 'Keep Practicing!'}
            </Text>
            <Text style={styles.resultsScore}>{score.toFixed(1)}%</Text>
            <Text style={styles.resultsDetail}>
              {correctCount} out of {quiz.questions.length} correct
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.back()}>
              <Text style={styles.primaryButtonText}>Back to Module</Text>
            </Pressable>
          </View>

          {/* Review Answers */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Review Answers</Text>
            {quiz.questions.map((q, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === q.answer;
              
              return (
                <View key={index} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewNumber}>Q{index + 1}</Text>
                    <FontAwesome
                      name={isCorrect ? 'check' : 'times'}
                      size={16}
                      color={isCorrect ? '#4CAF50' : '#FF9800'}
                    />
                  </View>
                  <Text style={styles.reviewQuestion}>{q.question}</Text>
                  <Text style={styles.reviewAnswer}>
                    Your answer: <Text style={[styles.reviewAnswerValue, !isCorrect && styles.wrongAnswer]}>{userAnswer || 'Not answered'}</Text>
                  </Text>
                  {!isCorrect && (
                    <Text style={styles.reviewAnswer}>
                      Correct answer: <Text style={styles.correctAnswer}>{q.answer}</Text>
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Question ${currentQuestionIndex + 1}/${quiz.questions.length}`,
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          {currentQuestion.tos_topic_title && (
            <View style={styles.topicBadge}>
              <Text style={styles.topicText}>
                {currentQuestion.tos_topic_title} • {currentQuestion.aligned_bloom_level}
              </Text>
            </View>
          )}
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            
            return (
              <Pressable
                key={index}
                style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                onPress={() => handleSelectAnswer(option)}>
                <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                  {isSelected && <View style={styles.optionRadioInner} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Pressable
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}>
          <FontAwesome name="chevron-left" size={16} color={Colors.white} />
          <Text style={styles.navButtonText}>Previous</Text>
        </Pressable>

        <Pressable
          style={[styles.navButton, styles.navButtonPrimary, !selectedAnswer && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedAnswer}>
          <Text style={styles.navButtonText}>
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next'}
          </Text>
          <FontAwesome name="chevron-right" size={16} color={Colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

// ... styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
    textAlign: 'center',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topicBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  topicText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text,
  },
  questionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textLight,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: Colors.primary,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  optionText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
  },
  optionTextSelected: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  navigation: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: Colors.white,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  navButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
  },
  resultsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultsTitle: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.text,
    marginTop: 16,
  },
  resultsScore: {
    fontFamily: Fonts.bold,
    fontSize: 48,
    color: Colors.primary,
    marginTop: 8,
  },
  resultsDetail: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  primaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewNumber: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  reviewQuestion: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 8,
  },
  reviewAnswer: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
  },
  reviewAnswerValue: {
    fontFamily: Fonts.semiBold,
  },
  wrongAnswer: {
    color: '#FF9800',
  },
  correctAnswer: {
    color: '#4CAF50',
    fontFamily: Fonts.semiBold,
  },
});