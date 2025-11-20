import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FONT_FAMILY, PRIMARY_COLOR } from "@/constants/cognify-theme";

export default function AssessmentTest() {
  const router = useRouter();

  return (
    <View style={styles.assessmentSection}>
      <Text style={styles.assessmentTitle}>Ready to ace your exam?</Text>
      <Text style={styles.assessmentSubtitle}>
        Help us personalize your review! Take a short test
      </Text>

      <TouchableOpacity
        style={styles.assessmentButton}
        activeOpacity={0.8}
        onPress={() => router.push("/assessments")}
      >
        <Text style={styles.assessmentButtonText}>Start Assessment Test</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  assessmentSection: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  assessmentTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  assessmentSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 18,
    lineHeight: 18,
  },
  assessmentButton: {
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  assessmentButtonText: {
    fontFamily: FONT_FAMILY,
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
