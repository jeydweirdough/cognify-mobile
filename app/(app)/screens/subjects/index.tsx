import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { api } from "@/lib/api"; // Import your API client

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ReadinessCard data={MOCK_READINESS_DATA} />

        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <SubjectCard key={subject.id} data={subject} />
          ))
        ) : (
          <View style={styles.centered}>
            <Text style={{ fontFamily: Fonts.regular, marginTop: 20 }}>No subjects found.</Text>
          </View>
        )}
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
    paddingVertical: 15,
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