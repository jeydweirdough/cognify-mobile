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
import { Colors, Fonts } from "../../../constants/cognify-theme";

// --- GLOBAL STORAGE HACK FOR DEMO ---
if (!(global as any).MODULE_PROGRESS) {
  (global as any).MODULE_PROGRESS = {};
}

// --- MOCK DATA ---
const INITIAL_MOCK_MODULES = [
  {
    id: "1",
    title: "Introduction to Industrial and Organizational Psychology",
    author: "Ronald E. Riggo",
    progress: 0,
    quizTaken: false,
    imageIndex: 0,
  },
  {
    id: "2",
    title: "Organizational Theory, Design, and Change. Seventh Edition",
    author: "Gareth R. Jones",
    progress: 0,
    quizTaken: false,
    imageIndex: 1,
  },
  {
    id: "3",
    title: "Industrial Organizational Psychology. Understanding the Workspace",
    author: "Paul E. Levy",
    progress: 0,
    quizTaken: false,
    imageIndex: 2,
  },
  {
    id: "4",
    title: "A Scientist Practitioner Approach. Organizational Psychology",
    author: "Ronald E. Riggo",
    progress: 0,
    quizTaken: false,
    imageIndex: 3,
  },
];

export default function SubjectModulesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [modules, setModules] = useState(INITIAL_MOCK_MODULES);
  const [loading, setLoading] = useState(false);
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

  // --- SYNC PROGRESS ON FOCUS ---
  useFocusEffect(
    useCallback(() => {
      const storedProgress = (global as any).MODULE_PROGRESS;

      const updatedModules = INITIAL_MOCK_MODULES.map((m) => {
        const savedProgress =
          storedProgress[m.id] !== undefined
            ? storedProgress[m.id]
            : m.progress;

        return {
          ...m,
          progress: savedProgress,
        };
      });

      setModules(updatedModules);
    }, [])
  );

  // Custom Header Component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Pressable
        style={styles.backButton}
        // --- YOUR REQUESTED ROUTING ---
        onPress={() => {
          router.navigate("/(app)/screens/subjects");
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </Pressable>

      <View style={styles.headerTitleContainer}>
        {/* Using a placeholder for the title as in the screenshot */}
        <Text style={styles.headerTitle}>[subject_name]</Text>
      </View>
      {/* Empty view to push title to center */}
      <View style={{ width: 24, height: 24 }} />
    </View>
  );

  const renderModuleItem = ({
    item,
    index,
  }: {
    item: (typeof modules)[0];
    index: number;
  }) => {
    const isCompleted = item.progress >= 100 && item.quizTaken;

    // Show "Quiz Pending" if reading is capped at 90% but quiz not taken
    const showQuizPending = !item.quizTaken && item.progress >= 90;

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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  },
  headerTitleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
    display: "none",
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
    height: "100%",
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
