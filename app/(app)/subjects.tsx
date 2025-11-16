import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Pressable,
  View,
  Text,
  ScrollView,
  Image,
  Platform, // Use Platform for iOS/Android specific styling if needed
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Assuming you have 'expo-router', 'react-native-svg', and your theme/assets setup.
import { router } from "expo-router";
// NOTE: Colors and Fonts are assumed to be defined in your '../../constants/cognify-theme'
const Colors = {
  background: "#F8F8F8", // Light gray background
  white: "#FFFFFF",
  text: "#333333", // Dark text
  primary: "#6A2A94", // Main purple for activity indicator
};
const Fonts = {
  regular: "System",
  semiBold: "System",
  bold: "System",
};

import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";


const images = {
  "1": require("@/assets/images/psych_asses.png"),

  "2": require("@/assets/images/dev_psych.png"),

  "3": require("@/assets/images/abnormal_psych.png"),

  "4": require("@/assets/images/io_psych.png"),
};

// --- MOCK DATA STRUCTURES ---
interface ReadinessCardData {
  title: string;
  subtitle: string;
  percentage: number;
}

interface SubjectCardData {
  id: string;
  name: string;
  description: string;
  percentage: number;
  iconColor: string;
  iconBgColor: string;
}

const MOCK_READINESS_DATA: ReadinessCardData = {
  title: "Readiness Level",
  subtitle: "Your current pass probability",
  percentage: 46,
};

// **ADJUSTED MOCK DATA TO MATCH THE SCREENSHOT PERCENTAGES AND COLORS**
const MOCK_SUBJECTS_DATA: SubjectCardData[] = [
  {
    id: "1",
    name: "Psychological Assessment",
    description:
      "Understanding and using psychological tests to measure behavior and mental processes.",
    percentage: 60,
    iconColor: "#D8C713",
    iconBgColor: "#F0F5D5",
  },
  {
    id: "2",
    name: "Developmental Psychology",
    description:
      "Study of human growth and changes from childhood to adulthood.",
    percentage: 75,
    iconColor: "#4C609B",
    iconBgColor: "#E2E6F2",
  },
  {
    id: "3",
    name: "Abnormal Psychology",
    description:
      "Study of psychological disorders, their causes, and treatments.",
    percentage: 90,
    iconColor: "#30C49F",
    iconBgColor: "#E1F8F3",
  },
  {
    id: "4",
    name: "Industrial/Organizational Psychology",
    description:
      "Application of psychology to workplace behavior and performance.",
    percentage: 45,
    iconColor: "#D38A4D",
    iconBgColor: "#F9ECE3",
  },
];


/**
 * Custom Circular Progress Component (Readiness Card)
 */
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const size = 60;
  const strokeWidth = 5;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressStrokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Colors for the Readiness Card gradient (Purple to Orange) */}
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#8A46AD" />
            <Stop offset="100%" stopColor="#F59E0B" />
          </LinearGradient>
        </Defs>

        {/* Background Circle */}
        <Circle
          stroke="#4F267A" // Darker version of card background for better contrast
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress Arc */}
        <Circle
          stroke="url(#gradient)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.percentageTextContainer}>
        <Text style={styles.readinessPercentageText}>{percentage}%</Text>{" "}
        {/* Use different style for readiness percentage */}
      </View>
    </View>
  );
};

// Component for the Readiness Level Card
const ReadinessCard = ({ data }: { data: ReadinessCardData }) => (
  <View style={styles.readinessCard}>
    <View>
      <Text style={styles.readinessTitle}>{data.title}</Text>
      <Text style={styles.readinessSubtitle}>{data.subtitle}</Text>
    </View>
    <CircularProgress percentage={data.percentage} />
  </View>
);

// Component for the Subject Cards
const SubjectCard = ({ data }: { data: SubjectCardData }) => {
  // Image component for the icon
  const IconImage = () => (
    <View
      style={[
        styles.subjectIconContainer, // Use a container for the image/placeholder
        { backgroundColor: data.iconBgColor },
      ]}
    >
      {/* Placeholder for the image */}
      {/* NOTE: If using the original component's image structure, replace the View with Image and use the source prop */}
      <Image
        source={images[data.id as keyof typeof images]}
        style={styles.subjectIconImage}
        resizeMode="contain"
      />
    </View>
  );

  return (
    // Use Pressable to capture the entire card press
    <Pressable
      style={styles.subjectCard}
      onPress={() => router.push(`/(app)/subject/${data.id}`)}
    >
      {/* Subject Name (Aligned to the left, above the content block) */}
      <Text style={styles.subjectName}>{data.name}</Text>

      {/* Content Row: Icon | Description + Progress Bar + Percentage */}
      <View style={styles.subjectContentRow}>
        <IconImage />

        <View style={styles.subjectDetailsColumn}>
          {/* Description and Percentage Row */}
          <View style={styles.descriptionRow}>
            <Text style={styles.subjectDescription}>{data.description}</Text>
            <Text style={styles.subjectPercentage}>{data.percentage}%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${data.percentage}%`,
                    backgroundColor: data.iconColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default function LearningScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ReadinessCard data={MOCK_READINESS_DATA} />

        {MOCK_SUBJECTS_DATA.map((subject) => (
          <SubjectCard key={subject.id} data={subject} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Should be light gray for the body
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderColor: "#EFEFEF",
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10, // Added padding top for spacing
  },
  // --- Readiness Card Styles ---
  readinessCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6A2A94", // Main purple color
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    // Shadow to match the elevated look in the screenshot
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
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.white,
  },
  readinessSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#D4B8E3", // Lighter purple for subtitle
    marginTop: 4,
  },
  percentageTextContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  readinessPercentageText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.white, 
  },
  // --- Subject Card Styles ---
  subjectCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    // Subtle shadow/border effect from the screenshot
    borderWidth: 1,
    borderColor: "#EFEFEF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  subjectName: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10, // Space between title and content row
  },
  subjectContentRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Align icon to the top of the content block
  },
  subjectDetailsColumn: {
    flex: 1,
    marginLeft: 15, // Space between icon and details column
  },
  subjectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start", // Keep the icon at the top of the row
  },
  subjectIconImage: {
    width: 24, // Icon size
    height: 24, // Icon size
  },
  descriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 5,
  },
  subjectDescription: {
    flex: 1, // Allow text to take up most of the space
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18, // Added to improve readability and match block height
    marginRight: 10, // Space before percentage
  },
  subjectPercentage: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.text,
  },
  progressBarContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EAEAEA",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
