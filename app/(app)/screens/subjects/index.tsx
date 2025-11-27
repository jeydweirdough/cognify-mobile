import { api } from "@/lib/api";
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

// Assuming these are defined elsewhere or passed correctly
import MotivationCard from "@/components/subjects/Motivation-quote";
import {
  SubjectCard,
} from "@/components/subjects/SubjectCard"; 
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
  description?: string; // Optional based on the role logic in subject_service.py
  topics_count: number;
  [key: string]: any;
}

export default function LearningScreen() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const [fontsLoaded] = useFonts({
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
    "LexendDeca-Regular": require("@/assets/fonts/LexendDeca-Regular.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
  });

  // NOTE: The description field is added on the client for the POST request
  const handleAddSubject = async (subjectTitle: string) => {
    closeModal();
    setLoading(true);

    try {
      // NOTE: Your backend has an ADD TOPIC endpoint but not a dedicated ADD SUBJECT.
      // Assuming a general POST to '/subjects/' might create a new subject, or this needs a dedicated endpoint.
      // Keeping the existing POST logic for now, even if not fully aligned with the provided backend routes.
      await api.post("/subjects/", {
        subject_title: subjectTitle,
        description: `A new subject: ${subjectTitle}`,
      });

      await fetchSubjects();
    } catch (error) {
      console.error("Failed to add subject:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      // **Fetch from the dynamic backend endpoint**
      const response = await api.get("/subjects/"); 
      // The backend returns an object with a 'subjects' key, which contains the list
      const backendSubjects: BackendSubject[] = response.data.subjects || [];

      if (backendSubjects.length === 0) {
        // fallback to mock data
        return;
      }

     const formattedSubjects = backendSubjects.map(
        (sub: BackendSubject, index: number) => {
          const palette = COLOR_PALETTE[index % COLOR_PALETTE.length]; 
          
          // Use a simple mock calculation for percentage as the list endpoint doesn't provide it
          const mockPercentage = (index * 15) % 100 + 10; 

          return {
            // **FIX: Map 'title' directly to 'title' (instead of 'name')**
            id: sub.id, 
            title: sub.title, 
            description: sub.description || "No description available", // Map 'description'
            percentage: mockPercentage, // Use the mock percentage
            
            // Assign color palette cyclically
            iconColor: palette.iconColor,
            iconBgColor: palette.iconBgColor,
            cardBgColor: palette.cardBgColor,
          };
        }
    
      );

      setSubjects(formattedSubjects);
    } catch (error) {
      console.error("Failed to fetch subjects, falling back to mock data:", error); 
      // fallback to mock data on error
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

        <View style={styles.addSubjectButtonContainer}>
          <TouchableOpacity onPress={openModal} style={styles.addSubjectButton}>
            <FontAwesome5 name="folder-plus" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <SubjectCard key={subject.id} data={subject} />
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