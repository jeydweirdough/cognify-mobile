import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MotivationCardProps {
  quote?: string;
  // subtitle?: string;
}

export default function MotivationCard({
  quote = "Don't let what you cannot do interfere with what you can do",
  // subtitle = "",
}: MotivationCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🧠 Dopamine Booster</Text>
        {/* <Text style={styles.subtitle}>{subtitle}</Text> */}
      </View>
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#156781",
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    shadowColor: "#FDFFB8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    width: "80%", // row width set to 80%
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    // fontStyle: "italic",
    color: "#FFF",
  },
  // subtitle: {
  //   fontSize: 14,
  //   fontStyle: "italic",
  //   color: "rgba(255, 255, 255, 0.85)",
  //   lineHeight: 18,
  // },
  quoteContainer: {
    backgroundColor: "#f6ffffff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quoteText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
    color: "#6A2A94", // fallback primary color
  },
});
