import { Fonts } from "@/constants/cognify-theme";
import { getStudentReportAnalytics } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { CircularProgress } from "../subjects/CircularProgress";
import { analyzeReadiness } from "@/lib/api";

const Colors = { white: "#FFFFFF" };

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
          setLabel(readinessEnum.replace('_', ' ')); // "VERY_LOW" -> "VERY LOW"
        }
      } catch (e) {
        console.log("Error loading readiness", e);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  return (
    <View style={styles.readinessCard}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.readinessTitle}>{data?.title || "Readiness Level"}</Text>
        <Text style={styles.readinessSubtitle}>Current Level: {label}</Text>
        <Text style={styles.readinessDetail}>Pass Probability</Text>
      </View>

      <CircularProgress percentage={Math.round(percentage)} />
    </View>
  );
};

const styles = StyleSheet.create({
  readinessCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6E3D84",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    marginBottom: 15,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  readinessTitle: { fontFamily: Fonts.lexendDecaMedium, fontSize: 16, color: Colors.white },
  readinessSubtitle: { fontFamily: Fonts.lexendDecaRegular, fontSize: 14, color: "#FFF", fontWeight: 'bold', marginTop: 4 },
  readinessDetail: { fontFamily: Fonts.lexendDecaRegular, fontSize: 12, color: "#D4B8E3", marginTop: 2 },
});