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
  const initialLabel = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("industrial") && n.includes("organizational")) return "I";
    if (n.includes("psychological") && n.includes("assessment")) return "P";
    if (n.includes("abnormal")) return "A";
    if (n.includes("developmental")) return "D";
    const words = (name || "").trim().split(/\s+/);
    return (words[0]?.[0] || "S").toUpperCase();
  };
  const normalized = subjectScores.map((s) => {
    const pct = Math.round((s.correct / Math.max(s.total, 1)) * 100);
    const label = initialLabel(s.subject);
    const color = colorForSubject(s.subject);
    return { label, color, percent: isNaN(pct) ? 0 : pct };
  });

  const readableName = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("industrial") && n.includes("organizational")) return "I/O Psychology";
    if (n.includes("psychological") && n.includes("assessment")) return "Psychological Assessment";
    if (n.includes("abnormal")) return "Abnormal Psychology";
    if (n.includes("developmental")) return "Developmental Psychology";
    return name || "Subject";
  };

  const percEntries = subjectScores.map((s) => ({ name: readableName(s.subject), percent: Math.round((s.correct / Math.max(s.total, 1)) * 100) || 0 }));
  const percValues = percEntries.map((e) => e.percent);
  const maxVal = percValues.length ? Math.max(...percValues) : 0;
  const minVal = percValues.length ? Math.min(...percValues) : 0;
  const highestEntry = percEntries.find((e) => e.percent === maxVal) || { name: "—", percent: 0 };
  const lowestEntries = percEntries.filter((e) => e.percent === minVal);
  const lowestNamesArr = lowestEntries.map((e) => e.name);

  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <View style={styles.resultContainer}>
        <Text style={[styles.titleHeadline, { color: titleColor }]}>{titleText}</Text>
        <Text style={styles.titleSubtitle}>You answered {finalScore} out of {totalQuestions} questions correctly.</Text>

        <Image source={require("@/assets/images/cheer-up.gif")} style={styles.emojiImage} />
        <Text style={styles.captionText}>No worries! Every step is progress.</Text>

        <View style={styles.chartCard}>
          <View style={styles.chartInnerRow}>
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

        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>Result Analysis</Text>
          <Text style={styles.analysisText}>You got the highest at {highestEntry.name}.</Text>
          <Text style={styles.analysisText}>You got the lowest {lowestNamesArr.length > 0 ? lowestNamesArr.join(', ') : '—'}</Text>
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
  analysisCard: {
    borderWidth: 1,
    borderColor: "#626776ff",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 16,
    marginBottom: 20,
    width: 260,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  analysisTitle: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 14,
    color: "#6E3D84",
    marginBottom: 10,
    textAlign: "left",
  },
  analysisText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12.5,
    color: "#333",
    lineHeight: 20,
    opacity: 0.85,
  },
  analysisSubject: {
    fontFamily: Fonts.poppinsMedium,
    fontWeight: 700,
    color: "#992844ff",
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
