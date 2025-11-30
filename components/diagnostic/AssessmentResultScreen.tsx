// @/components/diagnostic/AssessmentResultScreen.tsx

import React from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
// Assuming Fonts import is available from parent context/structure
import { Fonts } from "../../constants/cognify-theme";

interface AssessmentResultScreenProps {
  score: number;
  totalQuestions: number;
  onReviewPress: () => void;
  recommendedSubjects?: string[];
  subjectScores?: { subject: string; correct: number; total: number }[];
}



// --- RESULT SCREEN COMPONENT ---
export const AssessmentResultScreen: React.FC<AssessmentResultScreenProps> = ({
  score,
  totalQuestions,
  onReviewPress,
  recommendedSubjects = [],
  subjectScores = [],
}) => {
  const finalScore = score;
  const titleText = "Room for Growth!";
  const titleColor = "#6E3D84";
  const MAX_BAR_HEIGHT = 120;

  const SUBJECT_COLORS = ["#E53935", "#EFBF34", "#4CAF50", "#6E3D84", "#1E88E5", "#8E24AA"];
  const colorForSubject = (name: string) => {
    const s = name || "";
    let sum = 0;
    for (let i = 0; i < s.length; i++) sum = (sum + s.charCodeAt(i)) % 1000;
    return SUBJECT_COLORS[sum % SUBJECT_COLORS.length];
  };
  const normalized = subjectScores.map((s) => {
    const pct = Math.round((s.correct / Math.max(s.total, 1)) * 100);
    const label = (s.subject?.[0] || "").toUpperCase();
    const color = colorForSubject(s.subject);
    return { label, color, percent: isNaN(pct) ? 0 : pct };
  });

  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <View style={styles.resultContainer}>
        <Text style={[styles.titleHeadline, { color: titleColor }]}>{titleText}</Text>
        <Text style={styles.titleSubtitle}>You answered {finalScore} out of {totalQuestions} questions correctly.</Text>

        <Image source={require("@/assets/images/okay.png")} style={styles.emojiImage} />
        <Text style={styles.captionText}>No worries! Every step is progress.</Text>

        <View style={styles.chartCard}>
          <View style={styles.chartInnerRow}>
            <View style={styles.axisContainer}>
              <View style={[styles.axisLabels, { height: MAX_BAR_HEIGHT }]}>
                {[100, 75, 50, 25, 0].map((v) => (
                  <Text key={`tick-${v}`} style={styles.axisLabel}>{v}</Text>
                ))}
              </View>
            </View>
            <View style={styles.chartBarsRow}>
              {normalized.map((b, idx) => (
                <View key={`${b.label}-${idx}`} style={styles.barItem}>
                  <View style={[styles.bar, { height: Math.max(10, Math.round((b.percent / 100) * MAX_BAR_HEIGHT)), backgroundColor: b.color }]} />
                  <Text style={styles.barLabel}>{b.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

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
  titleHeadline: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 26,
    marginBottom: 8,
  },
  titleSubtitle: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 18,
  },
  emojiImage: {
    width: 140,
    height: 140,
    marginBottom: 10,
    resizeMode: "contain",
  },
  captionText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: "#666",
    marginBottom: 18,
  },
  chartCard: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 16,
    marginBottom: 30,
    width: 260,
    backgroundColor: "#FFF",
  },
  chartInnerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 8,
  },
  chartBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flex: 1,
  },
  barItem: {
    alignItems: "center",
  },
  bar: {
    width: 30,
    borderRadius: 6,
    marginBottom: 8,
  },
  barLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 12,
    color: "#666",
  },
  axisContainer: {
    width: 26,
    marginRight: 6,
  },
  axisLabels: {
    justifyContent: "space-between",
  },
  axisLabel: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 10,
    color: "#999",
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
