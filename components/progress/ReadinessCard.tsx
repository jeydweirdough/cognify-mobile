import { Fonts } from "@/constants/cognify-theme";
import { analyzeReadiness, getStudentReportAnalytics } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { CircularProgress } from "../subjects/CircularProgress";

// Matches the profile header and "Review" banner
const Colors = {
  white: "#FFFFFF",
  cardBg: "#48316D",
  accentText: "#E0C8FF",
};

export const ReadinessCard = ({ data }: any) => {
  const { user } = useAuth();
  const [percentage, setPercentage] = useState<number>(0);
  const [label, setLabel] = useState<string>("Analyzing...");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.id) return;

      try {
        // 1. Trigger fresh analysis (this runs the ONNX model in backend)
        await analyzeReadiness(user.id);

        // 2. Fetch updated report
        const r = await getStudentReportAnalytics(user.id);
        const payload = r?.data || r;

        // 3. Extract mapped percentage (handled in api.ts helper)
        const op = payload?.overall_performance;
        const pct = Number(op?.passing_probability) || 0;
        const readinessEnum = op?.readiness_level || "Unknown";

        if (mounted) {
          setPercentage(pct);
          setLabel(readinessEnum.replace("_", " ")); // "VERY_LOW" -> "VERY LOW"
        }
      } catch (e) {
        console.log("Error loading readiness", e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <View style={styles.readinessCard}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.readinessTitle}>
          {data?.title || "Readiness Level"}
        </Text>
        <Text style={styles.readinessSubtitle}>Current Level: {label}</Text>
        <Text style={styles.readinessDetail}>Pass Probability</Text>
      </View>

      {/* Passed text color to ensure it matches the purple theme */}
      <CircularProgress percentage={Math.round(percentage)} />
    </View>
  );
};

const styles = StyleSheet.create({
  readinessCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardBg, // Updated to Deep Brand Purple
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#48316D",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  readinessTitle: {
    fontFamily: Fonts.lexendDecaMedium,
    fontSize: 18,
    color: Colors.white,
    fontWeight: "600",
  },
  readinessSubtitle: {
    fontFamily: Fonts.lexendDecaRegular,
    fontSize: 15,
    color: "#FFF",
    fontWeight: "bold",
    marginTop: 6,
  },
  readinessDetail: {
    fontFamily: Fonts.lexendDecaRegular,
    fontSize: 13,
    color: Colors.accentText,
    marginTop: 4,
  },
});
