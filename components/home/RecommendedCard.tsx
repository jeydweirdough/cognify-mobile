import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// Assuming FONT_FAMILY and PRIMARY_COLOR are correctly imported
import { FONT_FAMILY, PRIMARY_COLOR } from "@/constants/cognify-theme";

// --- NEW INTERFACE FOR PROPS ---
interface RecommendedCardProps {
  hasTakenAssessment: boolean;
  // This is used if hasTakenAssessment is true
  weakestSubject?: string; 
  // Function to handle pressing the card (e.g., navigate to assessment or subject)
  onCardPress: () => void; 
}

export default function RecommendedCard({
  hasTakenAssessment,
  weakestSubject = "Industrial/Organizational Psychology", // Default subject if true
  onCardPress,
}: RecommendedCardProps) {
  // --- CONTENT RENDER LOGIC ---
  let content;
  let title;

  if (!hasTakenAssessment) {
    // STATE 1: HINDI PA NAKAKAPAG-TAKE (NO SCORE)
    title = "Start Your Journey:";
    content = (
      <View style={styles.noAssessmentCard}>
        <Text style={styles.noAssessmentText}>
          Take Diagnostic to help us recommend the best subjects for your review!
        </Text>
        
        </View>
    );
  } else {
    // STATE 2: NAKAPAG-TAKE NA (MAY SCORE at RECOMMENDATION)
    title = "Recommend for You:";
    content = (
      <TouchableOpacity 
        style={styles.recommendedCard} 
        activeOpacity={0.9}
        onPress={onCardPress} // Assuming onCardPress navigates to the subject
      >
        <Text style={styles.sectionSubtitle}>Subject:</Text>
        <View style={styles.recommendedContent}>
          <Text style={styles.recommendedText}>
            {weakestSubject}
          </Text>
          <Text style={styles.arrowIcon}>→</Text>
        </View>
        <View style={styles.recommendedBadges}>
          <View style={styles.badgeStartFirst}>
            <Text style={styles.badgeText}>START FIRST</Text>
          </View>
          <View style={styles.badgeWeak}>
            <Text style={styles.badgeText}>WEAK</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // --- MAIN RENDER ---
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {content}
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  section: { marginTop: 24 },
  sectionTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  
  // --- Recommended Card Styles (EXISTING) ---
  recommendedCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendedContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recommendedText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: "600",
    paddingBottom: 6,
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  arrowIcon: { fontSize: 24, color: PRIMARY_COLOR, marginLeft: 8 },
  recommendedBadges: { flexDirection: "row", marginBottom: 15 },
  badgeStartFirst: {
    backgroundColor: "#70E3BB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeWeak: {
    backgroundColor: "#FFAEAF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: "Poppins-Medium", // Assuming this is defined
    color: "#000000",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  
  // --- New Styles for No Assessment State ---
  noAssessmentCard: {
    backgroundColor: "#F0F0FF", // Lighter background to differentiate
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D0D0FF",
    marginTop: 8,
    alignItems: 'center',
  },
  noAssessmentText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    color: "#333",
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  takeAssessmentButton: {
    backgroundColor: PRIMARY_COLOR, // Use primary color for CTA
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  takeAssessmentButtonText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});