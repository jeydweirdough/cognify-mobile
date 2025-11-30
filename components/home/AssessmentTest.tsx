import { hasTakenDiagnostic } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import ReadyAssessmentCard from "./ReadyAssessmentCard";
import ReviewCognifyCard from "./ReviewCognifyCard";

export default function AssessmentTest() {
  const [hasTaken, setHasTaken] = useState<boolean | null>(null); // null = unknown
  const { user, initialized, token } = useAuth() as any;

  useEffect(() => {
    if (!initialized) return;

    const checkTaken = async () => {
      try {
        if (token) {
          const flag = await hasTakenDiagnostic();
          if (flag) {
            setHasTaken(true);
            return;
          }
        }
        const key = user?.id
          ? `diagnostic_assessment_results:${user.id}`
          : "diagnostic_assessment_results";
        const raw = await storage.getItem(key);
        setHasTaken(!!raw);
      } catch {
        const key = user?.id
          ? `diagnostic_assessment_results:${user.id}`
          : "diagnostic_assessment_results";
        const raw = await storage.getItem(key);
        setHasTaken(!!raw);
      }
    };

    checkTaken();
  }, [initialized, user?.id, token]);

  // Render loader while we don't know yet
  if (!initialized || hasTaken === null) {
    return (
      <View style={styles.loaderSection}>
        <View style={{ alignItems: "center", paddingVertical: 6 }}>
          <ActivityIndicator color="#FFF" />
        </View>
      </View>
    );
  }

  // Once known, render proper card
  return hasTaken ? <ReviewCognifyCard /> : <ReadyAssessmentCard />;
}

const styles = StyleSheet.create({
  loaderSection: {
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
});
