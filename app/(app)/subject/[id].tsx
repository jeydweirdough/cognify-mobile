// SubjectModulesScreen.tsx

import { Colors, Fonts } from "@/constants/cognify-theme";
import { getSubjectTopics, listModulesBySubject } from "@/lib/api";
import { ModuleListItem, Subject } from "@/lib/types";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FOLDER_COLORS = [
  "#DDF6D2", 
  "#F1E9FF", 
  "#FFEFF2", 
];

 

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
  const [colorOrder, setColorOrder] = useState<string[]>(FOLDER_COLORS);
  const [subjectInfo, setSubjectInfo] = useState<{ title: string; description?: string; category?: string } | null>(null);

  useEffect(() => {
    const arr = [...FOLDER_COLORS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setColorOrder(arr);
  }, [id]);

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
      const subjRes = await getSubjectTopics(id);
      const subjData: Partial<Subject> = subjRes ?? {} as Partial<Subject>;
      const sTitle = String(subjData.title ?? subjectTitle ?? "Subject Modules");
      const sDesc = String(subjData.description ?? "");
      const sCat = "Subject";
      setSubjectInfo({ title: sTitle, description: sDesc, category: sCat });

      const modulesData = await listModulesBySubject(id);
      const fetchedModules: ModuleListItem[] = (modulesData || []).map((mod: any, index: number) => {
        const storedProgress = (global as any).MODULE_PROGRESS[mod.id] || 0;
        return {
          id: mod.id,
          title: mod.title ?? "Untitled Module",
          author: mod.purpose ?? mod.description ?? "",
          progress: storedProgress,
          quizTaken: storedProgress >= 90 && storedProgress < 100 ? false : storedProgress === 100,
          lectureContentUrl: mod.material_url ?? null,
        };
      });

      setModules(fetchedModules);

    } catch (error) {
      console.error("Failed to fetch subject topics:", error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [id, subjectTitle]);

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

  const renderSubjectOverview = () => {
    const title = subjectInfo?.title ?? String(subjectTitle ?? "Subject Modules");
    const desc = subjectInfo?.description ?? "No description available.";
    const tag = subjectInfo?.category && subjectInfo.category.trim().length ? subjectInfo.category : (title.includes("Subject") ? "Subject" : "Subject");

    return (
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeaderRow}>
          <Text style={styles.overviewTitle}>{title}</Text>
        </View>
        <View style={styles.overviewTag}><Text style={styles.overviewTagText}>{tag}</Text></View>
        <View style={styles.overviewLabelsRow}>
          <Text style={styles.overviewLabelText}>You can do it!</Text>
        </View>
        <View style={styles.overviewIllustrationWrap}>
          <View style={styles.overviewIllustrationCircle}>
            <Image source={require("@/assets/images/brain.png")} style={{ width: 160, height: 160, resizeMode: 'contain' }} />
          </View>
        </View>
        <View style={styles.courseHeaderRow}>
          <Text style={styles.courseHeaderText}>Description</Text>
          <Ionicons name="chevron-down-circle-outline" size={18} color="#6B7280" />
        </View>
        <Text style={styles.courseDescText}>{desc}</Text>
      </View>
    );
  };


  // 💡 EDITED: Update renderModuleItem to use ModuleListItem type
  const renderModuleItem = ({
    item,
    index,
  }: {
    item: ModuleListItem;
    index: number;
  }) => {
    
    const isCompleted = item.progress >= 100; // Check quizTaken is now part of the 100% logic
    // Show "Quiz Pending" if reading is capped at 90% but quiz not taken
    const showQuizPending = item.progress < 100 && item.progress >= 90; 

    const folderColor = colorOrder[index % colorOrder.length];

    return (
      <Pressable
        style={[styles.card, { backgroundColor: folderColor }]}
        onPress={() => {
          if (item.lectureContentUrl) {
            router.push({
              pathname: "/(app)/module/[id]",
              params: {
                id: item.id,
                title: item.title,
                author: item.author,
                materialUrl: item.lectureContentUrl,
              },
            });
          }
        }}
      >
        <View style={[styles.folderTab, { backgroundColor: folderColor }]} />
        <View style={styles.checkboxContainer}>
          <View
            style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
          >
            {isCompleted && (
              <FontAwesome name="check" size={12} color="white" />
            )}
          </View>
        </View>

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
            {showQuizPending ? (
              <Text style={styles.quizPendingText}>Quiz Pending</Text>
            ) : !item.lectureContentUrl ? (
              <Text style={styles.quizPendingText}>No material uploaded</Text>
            ) : null}
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

      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={renderModuleItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {renderSubjectOverview()}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Modules</Text>
              <Text style={styles.sectionSubtitle}>Begin your learning journey</Text>
            </View>
          </View>
        )}
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
  overviewCard: {
    marginHorizontal: 5,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 26,
    borderWidth: 1,
    borderColor: '#847c8cff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  overviewTitle: {
    fontFamily: Fonts.lexendDecaMedium,
    fontSize: 28,
    color: '#111827',
    lineHeight: 34,
    width: '100%',
    flex: 1,
  },
  overviewTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  overviewTagText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 11,
    color: '#9A3412',
  },
  overviewLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
    paddingRight: 6,
  },
  overviewLabelText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 11,
    color: '#6B7280',
  },
  overviewIllustrationWrap: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  overviewIllustrationCircle: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  courseHeaderText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 14,
    color: '#A16207',
  },
  courseDescText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 6,
  },
  card: {
    flexDirection: "row",
    borderRadius: 12,
    marginHorizontal: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DBCFEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  folderTab: {
    position: "absolute",
    top: -6,
    left: 16,
    width: 56,
    height: 16,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: "#DBCFEA",
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
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 18,
    color: "#1A1A1A",
  },
  sectionSubtitle: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
