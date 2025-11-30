// SubjectCard.tsx

import { Fonts } from "@/constants/cognify-theme";
import { router } from "expo-router";
import React from "react";
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
  // --- NEW LOGIC FOR PROGRESS CALCULATION (UNCHANGED) ---
  const topicIdsWithContent = data.topicIds; // Assume all fetched topic IDs are valid materials
  const totalMaterials = topicIdsWithContent.length;

  let overallPercentage = 0;

  if (totalMaterials > 0) {
    // 1. Sum up the progress of all relevant topics (those with IDs in topicIds)
    const totalProgressSum = topicIdsWithContent.reduce((sum, topicId) => {
      // Get the progress for this topic ID from the map
      const progress = data.topicProgressMap[topicId] || 0;
      return sum + progress;
    }, 0);

    // 2. Calculate the overall percentage
    // (Total Sum of Progress) / (Total Number of Materials)
    overallPercentage = Math.round(totalProgressSum / totalMaterials);
  }

  // Use the calculated percentage for display
  const displayPercentage = overallPercentage;

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Title outside the card */}
      <Text style={styles.subjectTitleOutside}>{data.title}</Text>

      <Pressable
        style={[styles.subjectCard, { backgroundColor: data.cardBgColor }]}
        onPress={() =>
          router.push({
            pathname: "/(app)/subject/[id]",
            params: { id: data.id, subjectTitle: data.title },
          })
        }
      >
        <View style={styles.row}>
          {/* Icon box */}
          <View style={[styles.iconBox, { backgroundColor: data.iconBgColor }]}>
            <Image
              source={getImageSource(data.title)}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>

          {/* Right side content */}
          <View style={styles.rightColumn}>
            <View style={styles.descRow}>
              <Text style={styles.description}>{data.description}</Text>
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
