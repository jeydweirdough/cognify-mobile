// SubjectCard.tsx

import { Fonts } from "@/constants/cognify-theme";
import { getStudentReportAnalytics, getSubjectTopics } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Images for subjects
const images: Record<string, any> = {
  "Psychological Assessment": require("@/assets/images/psych_asses.png"),
  "Developmental Psychology": require("@/assets/images/dev_psych.png"),
  "Abnormal Psychology": require("@/assets/images/abnormal_psych.png"),
  "Industrial-Organizational Psychology": require("@/assets/images/io_psych.png"),
};

// Define the shape of the data passed to SubjectCard
interface SubjectCardData {
  id: string;
  title: string;
  description: string;
  // 💡 FIX: Removed 'percentage: number;' because it is now calculated internally.
  iconColor: string;
  iconBgColor: string;
  cardBgColor: string;
  totalTopics: number; // New prop: total number of topics/modules
  topicProgressMap: Record<string, number>; // New prop: map of topicId -> progress (%)
  topicIds: string[]; // New prop: list of all topic IDs
}

/**
 * Static utility function to get the image source by ID.
 * This acts as the requested "static method" for image retrieval.
 * @param {string} id The subject ID.
 * @returns {any} The image source (result of require()).
 */
const getImageSource = (id: string): any => {
  return images[id];
};

export const SubjectCard = ({ data }: { data: SubjectCardData }) => {
  const { user } = useAuth() as any;
  const [backendPercentage, setBackendPercentage] = useState<number | null>(null);
  const [subjectTitle, setSubjectTitle] = useState<string>(data.title);
  const [subjectDescription, setSubjectDescription] = useState<string>(data.description);
  const [subjectImageUrl, setSubjectImageUrl] = useState<string | null>(null);
  const topicIdsWithContent = data.topicIds;
  const totalMaterials = topicIdsWithContent.length;

  let overallPercentage = 0;

  if (totalMaterials > 0) {
    const totalProgressSum = topicIdsWithContent.reduce((sum, topicId) => {
      const progress = data.topicProgressMap[topicId] || 0;
      return sum + progress;
    }, 0);
    overallPercentage = Math.round(totalProgressSum / totalMaterials);
  }

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (!user?.id) return;
        const res = await getStudentReportAnalytics(user.id);
        const resData = res?.data || res;
        const perf = Array.isArray(resData?.subject_performance) ? resData.subject_performance : [];
        const found = perf.find((sp: any) => {
          const sid = String(sp.subject_id ?? sp.id ?? "");
          const st = String(sp.subject_title ?? sp.title ?? "").toLowerCase();
          return sid === String(data.id) || st === String(data.title).toLowerCase();
        });
        const p = found && found.average_score != null ? Number(found.average_score) || 0 : null;
        if (mounted) setBackendPercentage(p);
      } catch {}
    };
    run();
    return () => { mounted = false; };
  }, [user?.id, data.id, data.title]);

  useEffect(() => {
    let mounted = true;
    const loadSubject = async () => {
      try {
        const s = await getSubjectTopics(String(data.id));
        const t = String(s?.title ?? subjectTitle ?? "");
        const d = String(s?.description ?? subjectDescription ?? "");
        if (mounted) {
          if (t) setSubjectTitle(t);
          if (d) setSubjectDescription(d);
        }
      } catch {}
    };
    loadSubject();
    return () => { mounted = false; };
  }, [data.id]);

  const displayPercentage = backendPercentage != null ? Math.round(backendPercentage) : overallPercentage;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.subjectTitleOutside}>{subjectTitle}</Text>

      <Pressable
        style={[styles.subjectCard, { backgroundColor: data.cardBgColor }]}
        onPress={() =>
          router.push({
            pathname: "/(app)/subject/[id]",
            params: { id: data.id, subjectTitle: subjectTitle },
          })
        }
      >
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: data.iconBgColor }]}>
            {subjectImageUrl ? (
              <Image source={{ uri: subjectImageUrl }} style={styles.iconImage} resizeMode="contain" />
            ) : (
              <Image source={getImageSource(subjectTitle)} style={styles.iconImage} resizeMode="contain" />
            )}
          </View>

          {/* Right side content */}
          <View style={styles.rightColumn}>
            <View style={styles.descRow}>
              <Text style={styles.description}>{subjectDescription}</Text>
              {/* Display the CALCULATED percentage */}
              <Text style={styles.percentageText}>{displayPercentage}%</Text>
            </View>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    // Use the CALCULATED percentage for the width
                    width: `${displayPercentage}%`,
                    backgroundColor: data.iconColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (styles remain the same)
  subjectTitleOutside: {
    fontFamily: Fonts.lexendDecaMedium,
    fontSize: 15,
    color: "#222",
    marginBottom: 15,
    marginLeft: 4,
  },
  subjectCard: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#AFAFAF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: { width: 50, height: 50 },
  rightColumn: { flex: 1, marginLeft: 14 },
  descRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  description: {
    flex: 1,
    fontFamily: Fonts.lexendDecaRegular,
    fontSize: 12.5,
    color: "#333",
    lineHeight: 18,
    marginRight: 12,
  },
  percentageText: {
    fontFamily: Fonts.lexendDecaMedium,
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  progressBarBackground: {
    marginTop: 8,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#D7D7D7",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },
});
