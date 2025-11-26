import { api } from "@/lib/api"; // Import your API client
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity, // <--- 1. Import TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons"; // <--- 2. Import icons for the button

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


const Fonts = {
  semiBold: "LexendDeca-Medium",
  regular: "LexendDeca-Regular",
  poppinsRegular: "Poppins-Regular",
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
  const [isModalVisible, setIsModalVisible] = useState(false); // <--- 4. Modal Visibility State

  const openModal = () => setIsModalVisible(true); // <--- 5. Modal Handlers
  const closeModal = () => setIsModalVisible(false);

  const [fontsLoaded] = useFonts({
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
    "LexendDeca-Regular": require("@/assets/fonts/LexendDeca-Regular.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
  });
  const handleAddSubject = async (subjectName: string) => {
  // 1. Close the modal immediately for a better user experience
  closeModal(); 
  
  // 2. Set loading state to prevent double submission
  setLoading(true);

  try {
    // 3. Call the API to create the new subject
    await api.post("/subjects/", {
      subject_name: subjectName,
      // You might need to send other default fields like description or icon data
      description: `A new subject: ${subjectName}`, 
    });

    // 4. Re-fetch the list of subjects to update the UI
    await fetchSubjects();
    
  } catch (error) {
    console.error("Failed to add subject:", error);
    // TODO: Add an alert or toast notification for the user on failure
  } finally {
    // 5. Turn off loading state
    setLoading(false);
  }
};

  // uncomment this if you want to use real backend data PERO ETO MUNA HA
  const MOCK_SUBJECTS_DATA = [
    {
      id: "1",
      name: "Psychological Assessment",
      description:
        "Understanding and using psychological tests to measure behavior and mental processes.",
      percentage: 60,
      iconColor: "#D8C713",
      iconBgColor: "#F0F5D5",
      cardBgColor: "#FDFFB8",
    },
    {
      id: "2",
      name: "Developmental Psychology",
      description:
        "Study of human growth and changes from childhood to adulthood.",
      percentage: 75,
      iconColor: "#4C609B",
      iconBgColor: "#E2E6F2",
      cardBgColor: "#FFE8CD",
    },
    {
      id: "3",
      name: "Abnormal Psychology",
      description:
        "Study of psychological disorders, their causes, and treatments.",
      percentage: 90,
      iconColor: "#30C49F",
      iconBgColor: "#FCF5EE",
      cardBgColor: "#FCF5EE",
    },
    {
      id: "4",
      name: "Industrial/Organizational Psychology",
      description:
        "Application of psychology to workplace behavior and performance.",
      percentage: 45,
      iconColor: "#D38A4D",
      iconBgColor: "#F9ECE3",
      cardBgColor: "#F4F8D3",
    },
  ];

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects/");

      // Access 'items' from the PaginatedResponse structure
      const backendSubjects = response.data.items || [];

      // Map backend data to the UI format
      const formattedSubjects = backendSubjects.map(
        (sub: any, index: number) => {
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
        }
      );

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

        {/* 6. Folder Button Implementation */}
        <View style={styles.addSubjectButtonContainer}>
          <TouchableOpacity onPress={openModal} style={styles.addSubjectButton}>
            <FontAwesome5 name="folder-plus" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {/* End of Folder Button Implementation */}

        {/* {subjects.length > 0 ? (
          subjects.map((subject) => (
            <SubjectCard key={subject.id} data={subject} />
          ))
        ) : (
          <View style={styles.centered}>
            <Text style={{ fontFamily: Fonts.regular, marginTop: 20 }}>
              No subjects found.
            </Text>
          </View>
        )} */}
        {MOCK_SUBJECTS_DATA.map((subject) => (
          <SubjectCard key={subject.id} data={subject} />
        ))}
      </ScrollView>
      {/* 7. AddSubject Modal Component */}
      <AddSubjectModal visible={isModalVisible} onClose={closeModal} onAdd={handleAddSubject} />{" "}
      {/* End of AddSubject Modal Component */}
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
    paddingBottom: 5,
    paddingTop: 10,
  },
  // 8. New Styles for the button
  addSubjectButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Aligns the button to the right
    paddingVertical: 0,
    paddingHorizontal: 5,
  },
  addSubjectButton: {
    padding: 8,
    borderRadius: 8, // Optional: for a subtle background/border if you want it
  },
  // End of New Styles
});
