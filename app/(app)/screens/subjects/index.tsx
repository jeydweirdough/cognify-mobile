// index.tsx (LearningScreen.tsx)

import { api, getSubjectTopics } from "@/lib/api"; // 💡 EDITED: Import getSubjectTopics
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { Topic } from "@/lib/types"; // 💡 Import Topic type if available

// Assuming these are defined elsewhere or passed correctly
import MotivationCard from "@/components/subjects/Motivation-quote";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import Header from "@/components/ui/header";
import { AddSubjectModal } from "@/components/subjects/AddSubjectModal";

const Colors = {
  background: "#F8F8F8",
  white: "#FFFFFF",
  text: "#333333",
  primary: "#6A2A94",
};

// Re-defining Fonts object locally for completeness if it's not imported correctly
const Fonts = {
  semiBold: "LexendDeca-Medium",
  regular: "LexendDeca-Regular",
  poppinsRegular: "Poppins-Regular",
};

const COLOR_PALETTE = [
  { iconColor: "#D8C713", iconBgColor: "#F0F5D5", cardBgColor: "#FDFFB8" },
  { iconColor: "#4C609B", iconBgColor: "#E2E6F2", cardBgColor: "#FFE8CD" },
  { iconColor: "#30C49F", iconBgColor: "#FCF5EE", cardBgColor: "#FCF5EE" },
  { iconColor: "#D38A4D", iconBgColor: "#F9ECE3", cardBgColor: "#F4F8D3" },
];

// Define the expected structure of a Subject item returned from the backend's list endpoint
interface BackendSubject {
  id: string;
  title: string;
  description?: string;
  topics_count: number;
  [key: string]: any;
}

// Define the enriched Subject structure for the UI
interface UISubject {
  id: string;
  title: string;
  description: string;
  iconColor: string;
  iconBgColor: string;
  cardBgColor: string;
  topicIds: string[]; // List of topic IDs for progress calculation
}

export default function LearningScreen() {
  const [loading, setLoading] = useState(true);
  // 💡 EDITED: Use the new UISubject interface
  const [subjects, setSubjects] = useState<UISubject[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // 💡 NEW STATE: Store the global topic progress map
  // This will be passed to SubjectCard to calculate overall progress
  const [topicProgressMap, setTopicProgressMap] = useState<Record<string, number>>({});

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const [fontsLoaded] = useFonts({
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
    "LexendDeca-Regular": require("@/assets/fonts/LexendDeca-Regular.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
  });

  // --- NEW: Helper to get the current global progress ---
  const getGlobalTopicProgress = () => {
    // Access the global storage for all topic progress
    const progressMap = (global as any).MODULE_PROGRESS || {};
    return progressMap;
  };

  const handleAddSubject = async (subjectTitle: string) => {
    closeModal();
    setLoading(true);

    try {
      await api.post("/subjects/", {
        subject_title: subjectTitle,
        description: `A new subject: ${subjectTitle}`,
      });

      await fetchSubjectsWithProgress();
    } catch (error) {
      console.error("Failed to add subject:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💡 EDITED: Main function to fetch subjects AND their topic/module IDs
  const fetchSubjectsWithProgress = async () => {
    try {
      // 1. Fetch Subject List
      const response = await api.get("/subjects/");
      const backendSubjects: BackendSubject[] = response.data.subjects || [];
      const progressMap = getGlobalTopicProgress(); // Get current progress map
      setTopicProgressMap(progressMap);

      if (backendSubjects.length === 0) {
        setSubjects([]);
        return;
      }

      // 2. Fetch Topics for each Subject in parallel
      const subjectPromises = backendSubjects.map(
        async (sub: BackendSubject, index: number) => {
          const palette = COLOR_PALETTE[index % COLOR_PALETTE.length];
          let topicIds: string[] = [];
          
          try {
            // Call the endpoint used in SubjectModulesScreen.tsx
            const topicsResponse = await getSubjectTopics(sub.id);
            // Filter topics to only include those with content, as done in SubjectModulesScreen.tsx
            const topicsWithContent = topicsResponse.topics.filter((t: Topic) => t.lecture_content);
            topicIds = topicsWithContent.map((t: Topic) => t.id);
            
          } catch (error) {
            console.error(`Failed to fetch topics for ${sub.title}:`, error);
            // Default to empty array on failure
          }
          
          return {
            id: sub.id,
            title: sub.title,
            description: sub.description || "No description available",
            // The percentage will be CALCULATED in SubjectCard
            iconColor: palette.iconColor,
            iconBgColor: palette.iconBgColor,
            cardBgColor: palette.cardBgColor,
            topicIds: topicIds, // Pass the list of relevant topic IDs
          };
        }
      );

      // Wait for all topic fetches to complete
      const formattedSubjects: UISubject[] = await Promise.all(subjectPromises);

      setSubjects(formattedSubjects);

    } catch (error) {
      console.error("Failed to fetch subjects or their topics:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjectsWithProgress();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // 💡 EDITED: Use the new function for refreshing
    fetchSubjectsWithProgress(); 
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
      <Header title="Learning" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <MotivationCard />

        <View style={styles.addSubjectButtonContainer}>
          <TouchableOpacity onPress={openModal} style={styles.addSubjectButton}>
            <FontAwesome5 name="folder-plus" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {subjects.length > 0 ? (
          subjects.map((subject) => (
            // 💡 EDITED: Pass totalTopics, topicIds, and the topicProgressMap
            <SubjectCard 
                key={subject.id} 
                data={{
                    ...subject,
                    topicProgressMap: topicProgressMap, // Pass the global progress map
                    totalTopics: subject.topicIds.length, // Pass the count
                }} 
            />
          ))
        ) : (
          <View style={styles.centered}>
            <Text style={{ fontFamily: Fonts.regular, marginTop: 20 }}>
              No subjects found.
            </Text>
          </View>
        )}
      </ScrollView>

      <AddSubjectModal
        visible={isModalVisible}
        onClose={closeModal}
        onAdd={handleAddSubject}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 5, paddingTop: 10 },
  addSubjectButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 0,
    paddingHorizontal: 5,
  },
  addSubjectButton: { padding: 8, borderRadius: 8 },
});
