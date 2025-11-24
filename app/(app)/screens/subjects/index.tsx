import { api } from "@/lib/api"; // Import your API client
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MotivationCard from "@/components/subjects/Motivation-quote";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import Header from "@/components/ui/header";

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

// Define a palette to cycle through for UI consistency since the backend doesn't provide colors
const COLOR_PALETTE = [
  { iconColor: "#D8C713", iconBgColor: "#F0F5D5", cardBgColor: "#FDFFB8" },
  { iconColor: "#4C609B", iconBgColor: "#E2E6F2", cardBgColor: "#FFE8CD" },
  { iconColor: "#30C49F", iconBgColor: "#FCF5EE", cardBgColor: "#FCF5EE" },
  { iconColor: "#D38A4D", iconBgColor: "#F9ECE3", cardBgColor: "#F4F8D3" },
];

export default function LearningScreen() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
    "LexendDeca-Regular": require("@/assets/fonts/LexendDeca-Regular.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
  });

// uncomment this if you want to use real backend data PERO ETO MUNA HA
const MOCK_SUBJECTS_DATA = [
  {
    id: "1",
    name: "Psychological Assessment",
    description: "Understanding and using psychological tests to measure behavior and mental processes.",
    percentage: 60,
    iconColor: "#D8C713",
    iconBgColor: "#F0F5D5",
    cardBgColor: "#FDFFB8",

  },
  {
    id: "2",
    name: "Developmental Psychology",
    description: "Study of human growth and changes from childhood to adulthood.",
    percentage: 75,
    iconColor: "#4C609B",
    iconBgColor: "#E2E6F2",
    cardBgColor: "#FFE8CD",
  },
  {
    id: "3",
    name: "Abnormal Psychology",
    description: "Study of psychological disorders, their causes, and treatments.",
    percentage: 90,
    iconColor: "#30C49F",
    iconBgColor: "#FCF5EE",
    cardBgColor: "#FCF5EE",
  },
  {
    id: "4",
    name: "Industrial/Organizational Psychology",
    description: "Application of psychology to workplace behavior and performance.",
    percentage: 45,
    iconColor: "#D38A4D",
    iconBgColor: "#F9ECE3",
    cardBgColor: "#F4F8D3",
  },
];


  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/');
      
      // Access 'items' from the PaginatedResponse structure
      const backendSubjects = response.data.items || [];

      // Map backend data to the UI format
      const formattedSubjects = backendSubjects.map((sub: any, index: number) => {
      // Use backend colors if available, otherwise cycle through palette
      const palette = COLOR_PALETTE[index % COLOR_PALETTE.length];
      
      return {
        id: sub.subject_id, 
        name: sub.subject_name, // Note: backend uses subject_name, UI uses name
        description: sub.description || "No description available",
        percentage: 0, // Placeholder until progress API is ready
        
        // Visuals: Prefer backend, fallback to palette
        iconColor: sub.icon_color || palette.iconColor,
        iconBgColor: sub.icon_bg_color || palette.iconBgColor,
        cardBgColor: sub.card_bg_color || palette.cardBgColor,
      };
    });

      setSubjects(formattedSubjects);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects();
  };

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
  <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>

      <Header title="Materials" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
                <MotivationCard />
        
        {/* <ReadinessCard data={MOCK_READINESS_DATA} /> */}

        {/* {subjects.length > 0 ? (
          subjects.map((subject) => (
            <SubjectCard key={subject.id} data={subject} />
          ))
        ) : (
          <View style={styles.centered}>
            <Text style={{ fontFamily: Fonts.regular, marginTop: 20 }}>No subjects found.</Text>
          </View>
        )} */}
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
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
});