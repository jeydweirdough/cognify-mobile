// @/components/diagnostic/AssessmentResultScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
// Assuming Fonts import is available from parent context/structure
import { Fonts } from "../../constants/cognify-theme";

interface AssessmentResultScreenProps {
  score: number;
  totalQuestions: number;
  onReviewPress: () => void;
}



// --- RESULT SCREEN COMPONENT ---
export const AssessmentResultScreen: React.FC<AssessmentResultScreenProps> = ({
  score,
  totalQuestions,
  onReviewPress,
}) => {
  const finalScore = score;
  const passed = finalScore >= totalQuestions / 2; // 50% passing (10/20)

  // Dynamic variables for Pass vs Fail
  const titleText = passed ? "Excellent!" : "Keep Trying!";
  const titleColor = passed ? "#4CAF50" : "#E53935"; // Green vs Red
  const iconName = passed ? "happy" : "sad";
  const iconColor = passed ? "#FFC107" : "#BDBDBD"; // Gold vs Grey
  const starColor = passed ? "#FFC107" : "#E0E0E0"; // Gold vs Light Grey

  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <View style={styles.resultContainer}>
        <Text style={[styles.resultTitleText, { color: titleColor }]}>
          {titleText}
        </Text>

        <View style={styles.smileyContainer}>
          <Ionicons name={iconName as any} size={100} color={iconColor} />
        </View>

        <View style={styles.starsRow}>
          <Ionicons
            name="star"
            size={32}
            color={starColor}
            style={styles.starSide}
          />
          <Ionicons
            name="star"
            size={42}
            color={starColor}
            style={styles.starCenter}
          />
          <Ionicons
            name="star"
            size={32}
            color={starColor}
            style={styles.starSide}
          />
        </View>

        <Text style={styles.mockText}>Diagnostic Assessment</Text>

        <Text
          style={[
            styles.passedText,
            { color: passed ? "#6E3D84" : "#D32F2F" },
          ]}
        >
          {passed ? "Assessment Passed !" : "Assessment Failed"}
        </Text>

        <Text style={styles.scoreDescription}>
          You answered {finalScore} out of {totalQuestions} questions
          correctly.
        </Text>

        <Pressable style={styles.reviewButton} onPress={onReviewPress}>
          <Text style={styles.reviewButtonText}>Review Answers</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
  
};

// Merged styles for this component (Result Screen Styles)
const styles = StyleSheet.create({
  container: { flex: 1 },
  // --- RESULT STYLES ---
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  resultTitleText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 32,
    marginBottom: 24,
  },
  smileyContainer: { marginBottom: 20 },
  starsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 20,
  },
  starSide: { marginBottom: 5 },
  starCenter: { marginHorizontal: 8, marginBottom: 10 },
  mockText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: "#000",
    marginTop: 10,
  },
  passedText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 22,
    marginVertical: 8,
  },
  scoreDescription: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  reviewButton: {
    backgroundColor: "#6E3D84",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#6E3D84",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  reviewButtonText: {
    color: "#FFF",
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
  },
});