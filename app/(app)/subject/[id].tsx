// SubjectModulesScreen.tsx

import { FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Fonts } from "@/constants/cognify-theme";
import { getSubjectTopics } from "@/lib/api"; // Assuming api.ts is at /api
import { ModuleListItem, Topic } from "@/lib/types"; // Import new types

// --- GLOBAL STORAGE HACK FOR DEMO ---
if (!(global as any).MODULE_PROGRESS) {
  (global as any).MODULE_PROGRESS = {};
}

// --- REMOVE MOCK DATA (INITIAL_MOCK_MODULES) ---
// We will replace it with an empty array and load it dynamically.

export default function SubjectModulesScreen() {
  const { id, subjectTitle } = useLocalSearchParams<{
    id: string;
    subjectTitle?: string;
  }>();
  // 💡 EDITED: Use the new dynamic type and initialize to an empty array
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [loading, setLoading] = useState(true); // 💡 EDITED: Start as true since we are now loading data
  const navigation = useNavigation();

  // --- HIDE BOTTOM TABS ---
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [navigation]);

  // 💡 NEW: Function to fetch topics dynamically
  const fetchTopics = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      // 1. Fetch Subject data which contains the topics array
      const subjectData = await getSubjectTopics(id);
      
      // 2. Map Topic array to the ModuleListItem structure
      const fetchedTopics: ModuleListItem[] = subjectData.topics.map((topic: Topic, index: number) => {
        // NOTE: 'author', 'progress', and 'quizTaken' are derived/mocked 
        // until a more complex backend structure is implemented.
        const storedProgress = (global as any).MODULE_PROGRESS[topic.id] || 0;
        
        return {
          id: topic.id,
          title: topic.title,
          // TEMP: Use topic ID as author placeholder or pull from a hypothetical author field
          author: `Content ID: ${topic.id.slice(0, 8)}`, 
          progress: storedProgress,
          quizTaken: storedProgress >= 90 && storedProgress < 100 ? false : storedProgress === 100, // Simple logic
          lectureContentUrl: topic.lecture_content || null,
        };
      });

      setModules(fetchedTopics);

    } catch (error) {
      console.error("Failed to fetch subject topics:", error);
      // Handle error display to the user if needed
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // --- SYNC PROGRESS ON FOCUS (MODIFIED) ---
  useFocusEffect(
    useCallback(() => {
      fetchTopics(); // 💡 EDITED: Fetch data AND update progress on focus
      
      // The old progress sync logic is now integrated into fetchTopics 
      // via the storedProgress calculation. 
      // We keep fetchTopics() here to ensure the latest progress is shown.
    }, [fetchTopics]) // Depend on fetchTopics
  );

  // Custom Header Component
  // ... (renderHeader is unchanged)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.navigate("/(app)/screens/subjects");
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </Pressable>

      <View style={styles.headerTitleContainer}>
        {/* Subject Title (Aligned with the back button's row) */}
        <Text style={styles.headerTitle}>
          {subjectTitle || "Subject Modules"}
        </Text>

        {/* "Materials" subtitle (Appears below the title) */}
        <Text style={styles.headerSubtitle}>Materials</Text>
      </View>
      {/* Empty view to push title to center */}
      <View style={{ width: 24, height: 24 }} />
    </View>
  );


  // 💡 EDITED: Update renderModuleItem to use ModuleListItem type
  const renderModuleItem = ({
    item,
    index,
  }: {
    item: ModuleListItem; // Use the new interface
    index: number;
  }) => {
    // 💡 NEW CHECK: Do not render if lectureContentUrl is null (no material uploaded yet)
    if (!item.lectureContentUrl) {
      return null;
    }
    
    const isCompleted = item.progress >= 100; // Check quizTaken is now part of the 100% logic
    // Show "Quiz Pending" if reading is capped at 90% but quiz not taken
    const showQuizPending = item.progress < 100 && item.progress >= 90; 

    // Re-use cover URLs for visual variation
    const coverUrls = [
      "https://covers.openlibrary.org/b/id/8235112-M.jpg",
      "https://covers.openlibrary.org/b/id/12547189-M.jpg",
      "https://covers.openlibrary.org/b/id/10603687-M.jpg",
      "https://covers.openlibrary.org/b/id/8259445-M.jpg",
    ];

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/(app)/module/[id]",
            params: {
              id: item.id,
              title: item.title,
              author: item.author,
              coverUrl: coverUrls[index % 4],
              // Pass the material URL to the module screen for display
              materialUrl: item.lectureContentUrl
            },
          })
        }
      >
        <View style={styles.checkboxContainer}>
          <View
            style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
          >
            {isCompleted && (
              <FontAwesome name="check" size={12} color="white" />
            )}
          </View>
        </View>

        <Image
          source={{ uri: coverUrls[index % 4] }}
          style={styles.bookCover}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.cardTitle} numberOfLines={3}>
              {item.title}
            </Text>

            <Text style={styles.cardAuthor} numberOfLines={1}>
              {item.author}
            </Text>
          </View>

          <View style={styles.progressWrapper}>
            <View style={styles.progressBarTrack}>
              <View
                style={[styles.progressBarFill, { width: `${item.progress}%` }]}
              />
            </View>
            {showQuizPending && (
              <Text style={styles.quizPendingText}>Quiz Pending</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }
  
  // 💡 NEW: Handle case where no materials are available/uploaded
  if (modules.length === 0) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <Stack.Screen options={{ headerShown: false }} />
          {renderHeader()}
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No study materials found for this subject.</Text>
            <Text style={styles.emptySubText}>Check back later or try a different subject.</Text>
          </View>
        </SafeAreaView>
      );
  }

  // ... (The rest of the return is largely unchanged)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {renderHeader()}

      {/* 💡 EDITED: Filter to only show topics with content (material uploaded) */}
      <FlatList
        data={modules.filter(m => m.lectureContentUrl)} 
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={renderModuleItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
// ... (The rest of the styles are unchanged)
// ADDED NEW STYLES:
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
// ... (existing styles)
// ... (existing styles)
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 10,
    borderBottomWidth: 0.3,
    borderColor: "#000000",
    backgroundColor: "#F7F8FB",
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 0,
  },
  headerSubtitle: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FBFCE5",
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBCFEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#5A5A5A",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#B71C1C",
    borderColor: "#B71C1C",
  },
  bookCover: {
    width: 70,
    height: 100,
    borderRadius: 2,
    marginRight: 15,
    backgroundColor: "#ddd",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  cardTitle: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 14,
    color: "#000",
    lineHeight: 18,
    marginBottom: 4,
  },
  cardAuthor: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    color: "#757575",
  },
  progressWrapper: {
    marginTop: 10,
    justifyContent: "flex-end",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    width: "100%",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#D88C85",
    borderRadius: 3,
  },
  quizPendingText: {
    fontSize: 10,
    color: "#B71C1C",
    fontFamily: Fonts.poppinsMedium,
    marginTop: 4,
    textAlign: "right",
  },
});