import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FONT_FAMILY, PRIMARY_COLOR } from "@/constants/cognify-theme";

export default function RecommendedCard() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recommend for You:</Text>
      <TouchableOpacity style={styles.recommendedCard} activeOpacity={0.9}>
        <Text style={styles.sectionSubtitle}>Subject:</Text>
        <View style={styles.recommendedContent}>
          <Text style={styles.recommendedText}>
            Industrial/Organizational Psychology
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
    </View>
  );
}

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
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  arrowIcon: { fontSize: 24, color: PRIMARY_COLOR, marginLeft: 8 },
  recommendedBadges: { flexDirection: "row", marginBottom: 10 },
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
    fontFamily: "Poppins-Medium",
    color: "#000000",
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
