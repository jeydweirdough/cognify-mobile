import { PRIMARY_COLOR } from "@/constants/cognify-theme";
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

    const checkTakenFast = async () => {
      const key = user?.id
        ? `diagnostic_assessment_results:${user.id}`
        : "diagnostic_assessment_results";

      try {
        const raw = await storage.getItem(key);
        setHasTaken(!!raw);
      } catch {
        setHasTaken(false);
      }

      if (token) {
        try {
          const flag = await Promise.race([
            hasTakenDiagnostic(),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1500)),
          ]);
          if (flag) {
            setHasTaken(true);
            const existing = await storage.getItem(key);
            if (!existing) {
              await storage.setItem(key, JSON.stringify({ taken: true, timestamp: new Date().toISOString() }));
            }
          }
        } catch {}
      }
    };

    checkTakenFast();
  }, [initialized, user?.id, token]);

  // Render loader while we don't know yet
  if (hasTaken === null) {
    return (
      <View style={styles.loaderSection}>
        <View style={{ alignItems: "center", paddingVertical: 6 }}>
          <ActivityIndicator color={PRIMARY_COLOR} />
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
