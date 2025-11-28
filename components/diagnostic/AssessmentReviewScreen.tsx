// @/components/diagnostic/AssessmentReviewScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
// Assuming Fonts import is available from parent context/structure
import { Fonts } from "../../constants/cognify-theme";

interface QuestionData {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface AssessmentReviewScreenProps {
  QUIZ_DATA: QuestionData[];
  userAnswers: (number | null)[];
}

// --- REVIEW SCREEN COMPONENT ---
export const AssessmentReviewScreen: React.FC<AssessmentReviewScreenProps> = ({
  QUIZ_DATA,
  userAnswers,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <StatusBar barStyle="dark-content" />

      {/* Review Header */}
      <View style={styles.reviewHeader}>
        {/* Back To Home Button (Arrow + Text) */}
        <Pressable
          style={styles.reviewBackButton}
          onPress={() => router.push("/")} // Navigate to Home
        >
          <Ionicons name="arrow-back" size={20} color="#381E72" />
          <Text style={styles.reviewBackText}>Back to Home</Text>
        </Pressable>

        <View style={styles.reviewTitleContainer}>
          <Text style={styles.reviewHeaderTitle}>
            Diagnostic Assessment Results
          </Text>
          <Text style={styles.reviewHeaderSubtitle}>Review Answers</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.reviewScrollContent}>
        {QUIZ_DATA.map((question, index) => {
          const userAnswerIndex = userAnswers[index];
          const isCorrect = userAnswerIndex === question.correctIndex;
          const currentSubject = question.subject;
          const previousSubject =
            index > 0 ? QUIZ_DATA[index - 1].subject : null;
          const showSubjectTitle = currentSubject !== previousSubject;

          return (
            <View key={question.id} style={styles.reviewQuestionContainer}>
              {showSubjectTitle && (
                <View style={styles.reviewSubjectHeader}>
                  <Text style={styles.reviewSubjectTitle}>
                    {currentSubject}
                  </Text>
                  <View style={styles.reviewSubjectUnderline} />
                </View>
              )}

              <View style={styles.reviewQuestionLabelContainer}>
                <Text style={styles.reviewQuestionLabel}>
                  Question {index + 1}
                </Text>
                <View style={styles.reviewUnderline} />
              </View>
              <Text style={styles.reviewQuestionText}>
                {question.question}
              </Text>

              {/* Display User's Incorrect Answer */}
              {!isCorrect && userAnswerIndex !== null && (
                <View style={styles.reviewAnswerRow}>
                  <Ionicons name="close-circle" size={24} color="#FF5252" />
                  <Text
                    style={[styles.reviewAnswerText, { color: "#FF5252" }]}
                  >
                    Your Answer: {question.options[userAnswerIndex]}
                  </Text>
                </View>
              )}

              {/* Display Correct Answer */}
              <View style={styles.reviewAnswerRow}>
                <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                <Text
                  style={[
                    styles.reviewAnswerText,
                    { color: "#2E7D32", fontWeight: "bold" },
                  ]}
                >
                  Correct Answer: {question.options[question.correctIndex]}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

// Merged styles for this component (Review Screen Styles)
const styles = StyleSheet.create({
  container: { flex: 1 },
  // --- REVIEW SCREEN STYLES ---
  reviewHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  reviewBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  reviewBackText: {
    color: "#381E72",
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    marginLeft: 8,
  },
  reviewTitleContainer: {
    width: "100%",
    alignItems: "center",
    
  },
  reviewHeaderTitle: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
    textAlign: "center",
  },
  reviewHeaderSubtitle: {
    fontFamily: Fonts.lexendDecaRegular,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  reviewScrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  reviewSubjectHeader: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 15,
    marginTop: 10,
  },
  reviewSubjectTitle: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 18,
    color: "#381E72",
    marginBottom: 5,
  },
  reviewSubjectUnderline: {
    height: 2,
    backgroundColor: "#381E72",
    width: 100,
  },
  reviewQuestionContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
    borderWidth: 1.8,
    borderColor: "#0b0d3eff",
  },
  reviewQuestionLabelContainer: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  reviewQuestionLabel: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 13,
    color: "#7C7255",
  },
  reviewUnderline: {
    height: 1,
    backgroundColor: "#C5A900",
    width: "100%",
    marginTop: 2,
  },
  reviewQuestionText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 15,
    color: "#423815",
    lineHeight: 22,
    marginBottom: 15,
  },
  reviewAnswerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  reviewAnswerText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    marginTop: 2,
  },
});