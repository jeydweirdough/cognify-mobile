import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import { ReadinessCard } from "@/components/subjects/ReadinessCard";
import { SubjectCard } from "@/components/subjects/SubjectCard";

const Colors = {
  background: "#F8F8F8",
  white: "#FFFFFF",
  text: "#333333",
  primary: "#6A2A94",
};

const Fonts = {
  semiBold: "LexendDeca-Medium",
  regular: "LexendDeca-Regular",
  poppinsRegular: "Poppins-Regular",
};

const MOCK_READINESS_DATA = {
  title: "Readiness Level",
  subtitle: "Your current pass probability",
  percentage: 39,
};

const MOCK_SUBJECTS_DATA = [
  {
    id: "1",
    name: "Psychological Assessment",
    description: "Understanding and using psychological tests to measure behavior and mental processes.",
    percentage: 60,
    iconColor: "#D8C713",
    iconBgColor: "#F0F5D5",
  },
  {
    id: "2",
    name: "Developmental Psychology",
    description: "Study of human growth and changes from childhood to adulthood.",
    percentage: 75,
    iconColor: "#4C609B",
    iconBgColor: "#E2E6F2",
  },
  {
    id: "3",
    name: "Abnormal Psychology",
    description: "Study of psychological disorders, their causes, and treatments.",
    percentage: 90,
    iconColor: "#30C49F",
    iconBgColor: "#FCF5EE",
  },
  {
    id: "4",
    name: "Industrial/Organizational Psychology",
    description: "Application of psychology to workplace behavior and performance.",
    percentage: 45,
    iconColor: "#D38A4D",
    iconBgColor: "#F9ECE3",
  },
];

export default function LearningScreen() {
  const [loading, setLoading] = useState(true);

  // Load custom font
  const [fontsLoaded] = useFonts({
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
    "LexendDeca-Regular": require("@/assets/fonts/LexendDeca-Regular.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading || !fontsLoaded) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    paddingTop: 10,
  },
});
