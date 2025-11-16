import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Pressable,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

// import { api } from '../../lib/api'; // Commented out for mock data
import { router } from 'expo-router';
// Assuming you have these theme constants
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
// import type { Subject, PaginatedResponse } from '../../lib/types'; // Commented out for mock data

// --- MOCK DATA STRUCTURES ---
// Define the structure of the mocked data to represent the cards
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

// Mocked data to perfectly match the screenshot
const MOCK_READINESS_DATA: ReadinessCardData = {
  title: 'Readiness Level',
  subtitle: 'Your current pass probability',
  percentage: 36,
};

const MOCK_SUBJECTS_DATA: SubjectCardData[] = [
  {
    id: '1',
    name: 'Psychological Assessment',
    description:
      'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain.',
    percentage: 60,
    iconColor: '#D8C713', // Yellow/Gold
    iconBgColor: '#F0F5D5', // Light Yellow/Green
  },
  {
    id: '2',
    name: 'Developmental Psychology',
    description:
      'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain.',
    percentage: 75,
    iconColor: '#4C609B', // Blue/Purple
    iconBgColor: '#E2E6F2', // Light Blue/Gray
  },
  {
    id: '3',
    name: 'Abnormal Psychology',
    description:
      'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain.',
    percentage: 90,
    iconColor: '#30C49F', // Green/Teal
    iconBgColor: '#E1F8F3', // Light Green
  },
  {
    id: '4',
    name: 'Industrial/Organizational Psychology',
    description:
      'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain.',
    percentage: 45,
    iconColor: '#D38A4D', // Orange/Brown
    iconBgColor: '#F9ECE3', // Light Orange
  },
];
// --- END MOCK DATA STRUCTURES ---

/**
 * Custom Circular Progress Component (Styled to match the image)
 * Note: The actual progress animation logic is simplified for this example.
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
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {/* The gradient colors based on the image: Darker Purple/Orange */}
            <Stop offset="0%" stopColor="#8A46AD" /> 
            <Stop offset="100%" stopColor="#F59E0B" />
          </LinearGradient>
        </Defs>

        {/* Background Circle (Light Grey) */}
        <Circle
          stroke="#E0E0E0"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle (Gradient) */}
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
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>
    </View>
  );
};

// Component for the Readiness Level Card (The large purple card)
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
  // Line calculations
  const totalWidth = 280; // Placeholder based on general card size in RN
  const lineFilledWidth = (data.percentage / 100) * totalWidth;

  // Placeholder for the icon (using a simple styled View)
  const IconPlaceholder = () => (
    <View
      style={[
        styles.subjectIconPlaceholder,
        { backgroundColor: data.iconBgColor },
      ]}>
      {/* Actual image/icon will go here */}
      <Text style={{ color: data.iconColor }}>{data.name.charAt(0)}</Text>
    </View>
  );

  return (
    <Pressable
      style={styles.subjectCard}
      onPress={() => router.push(`/(app)/subject/${data.id}`)}>
      <View style={styles.subjectCardHeader}>
        <IconPlaceholder />
        <Text style={styles.subjectName}>{data.name}</Text>
      </View>

      <View style={styles.subjectContent}>
        <Text style={styles.subjectDescription}>{data.description}</Text>
        <Text style={styles.subjectPercentage}>{data.percentage}%</Text>
      </View>

      {/* Progress Bar (Styled to match the image's line progress) */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${data.percentage}%`, backgroundColor: data.iconColor },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default function LearningScreen() {
  const [loading, setLoading] = useState(true);

  // Use a simple timeout to simulate fetching
  useEffect(() => {
    // Simulate API call delay
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

  // Use ScrollView to hold all the stacked cards
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Readiness Card */}
        <ReadinessCard data={MOCK_READINESS_DATA} />

        {/* Subject Cards */}
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
    backgroundColor: Colors.background, // Assuming a light background color
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- MOCK STATUS BAR STYLES ---
  statusBarMock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 8,
    // Note: The actual status bar is above SafeAreaView on most devices
  },
  timeText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold, // Assuming the time is semi-bold
    color: '#000',
  },
  signalIconMock: {
    flexDirection: 'row',
    gap: 5,
  },
  // --- HEADER STYLES ---
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center', // Center the title for the look in the image
  },
  headerTitle: {
    fontFamily: Fonts.semiBold, // Using semiBold as a best guess for the main title
    fontSize: 18,
    color: Colors.text, // Assuming dark text color
  },
  // --- SCROLL CONTENT STYLES ---
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10, // Add a little space after the main header
  },
  // --- READINESS CARD STYLES ---
  readinessCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6A2A94', // Dark Purple
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  readinessTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.white,
  },
  readinessSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#D4B8E3', // Lighter purple for subtitle
    marginTop: 4,
  },
  // CircularProgress Styles
  percentageTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.text,
  },
  // --- SUBJECT CARD STYLES ---
  subjectCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    // Add light shadow/border to match the image's card separation
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subjectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  subjectName: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 10,
  },
  subjectContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 60, // Align text and percentage
    paddingRight: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  subjectDescription: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text, // Assuming dark text color
  },
  subjectPercentage: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 10,
  },
  // --- PROGRESS BAR STYLES ---
  progressBarContainer: {
    paddingLeft: 60, // Align with the start of the description text
    paddingRight: 5,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAEAEA', // Light background of the bar
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    // The background color will be dynamically set by the component
  },
  // --- ICON PLACEHOLDER STYLES ---
  subjectIconPlaceholder: {
    position: 'absolute', // Allows the progress bar to go under
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // The icon color/background is set dynamically
  },
});