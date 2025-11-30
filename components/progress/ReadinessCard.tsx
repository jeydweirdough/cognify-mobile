import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { CircularProgress } from "../subjects/CircularProgress";
import { useAuth } from "@/lib/auth";
import { getStudentReportAnalytics } from "@/lib/api";

const Colors = {
  white: "#FFFFFF",
};

const Fonts = {
  regular: "Poppins-Regular",
};

export const ReadinessCard = ({ data }: any) => {
  const { user } = useAuth();
  const [percentage, setPercentage] = useState<number>(typeof data?.percentage === "number" ? data.percentage : 0);
  const [subtitle, setSubtitle] = useState<string>(data?.subtitle || "Your current pass probability");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.id) return;
      try {
        const r = await getStudentReportAnalytics(user.id);
        const payload = r?.data || r;
        const op = payload?.overall_performance;
        const pct = Number(op?.passing_probability) || 0;
        const risk = op?.risk_level ? String(op.risk_level) : null;
        const rec = op?.recommendation ? String(op.recommendation) : null;
        if (mounted) {
          setPercentage(pct);
          if (risk || rec) setSubtitle(risk && rec ? `${risk} • ${rec}` : risk || rec || subtitle);
        }
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  return (
    <View style={styles.readinessCard}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.readinessTitle}>{data?.title || "Readiness Level"}</Text>
        <Text style={styles.readinessSubtitle}>{subtitle}</Text>
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
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  readinessTitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.white,
  },
  readinessSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#D4B8E3",
    marginTop: 4,
    flexShrink: 1, // wrap long text
  },
});
