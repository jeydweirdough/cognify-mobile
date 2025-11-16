import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  // Import Platform for conditional styling (optional but good practice)
  Platform,
} from "react-native";
// --- ACTUAL EXPO IMPORTS ---
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen"; // Used to manage the loading screen

// Keep the splash screen visible while we fetch resources
// Note: You must run 'npx expo install expo-font' and 'npx expo install expo-splash-screen'
SplashScreen.preventAutoHideAsync();

// --- CONSTANTS ---
const PRIMARY_COLOR = "#3E1E68";
const ACCENT_COLOR = "#000000ff";
const BACKGROUND_COLOR = "#FFFFFF";
// The key used here ('LexendDeca-Medium') must match the key in useFonts.
const FONT_FAMILY = "LexendDeca-Medium";

export default function App() {
  // --- ACTUAL FONT LOADING ---
  const [fontsLoaded] = useFonts({
    // Map the font family name to the asset location
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
  });
  // ---------------------------

  // Hide the splash screen once fonts are loaded
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const dailyPractice = [
    { day: "S", date: "15", completed: true },
    { day: "M", date: "16", completed: true },
    { day: "T", date: "17", completed: true },
    { day: "W", date: "18", active: true },
    { day: "T", date: "19", completed: false },
    { day: "F", date: "20", completed: false },
    { day: "S", date: "21", completed: false },
  ];

  const books = [
    {
      title: "Organizational Theory, Design and Change",
      image:
        "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400",
      progress: 65,
    },
    {
      title: "PSYCHOLOGY",
      image:
        "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=400",
      progress: 32,
    },
    {
      title: "Organizer",
      image:
        "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=400",
      progress: 80,
    },
  ];

  // If fonts aren't loaded, return null to keep the splash screen visible
  if (!fontsLoaded) {
    return null;
  }

  // Once fonts are loaded, the rest of the app renders
  // **FIXED: Replaced outermost SafeAreaView with a regular View**
  return (
    <View style={styles.rootContainer}>
      {/* Header */}
      <View style={styles.header}>
        {/* **FIXED: Wrapped header content in SafeAreaView** */}
        <SafeAreaView style={styles.headerContentSafeArea}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good Day to Learn!</Text>
              <Text style={styles.username}>Babycakes</Text>
            </View>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://i.pravatar.cc/100?img=5" }}
                style={styles.avatar}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Daily Practice Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Practice</Text>
              <Text style={styles.dayCounter}>Day 4</Text>
            </View>

            <View style={styles.practiceGrid}>
              {dailyPractice.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.practiceItem}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.practiceBox,
                      item.completed && styles.practiceCompleted,
                      item.active && styles.practiceActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.practiceDay,
                        (item.completed || item.active) &&
                          styles.practiceDayDark,
                      ]}
                    >
                      {item.day}
                    </Text>
                    <Text
                      style={[
                        styles.practiceDate,
                        (item.completed || item.active) &&
                          styles.practiceDateDark,
                      ]}
                    >
                      {item.date}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Assessment Test */}
          <View style={styles.assessmentSection}>
            <Text style={styles.assessmentTitle}>Ready to ace your exam?</Text>
            <Text style={styles.assessmentSubtitle}>
              Help us personalize your review! Take a short test
            </Text>
            <TouchableOpacity
              style={styles.assessmentButton}
              activeOpacity={0.8}
            >
              <Text style={styles.assessmentButtonText}>
                Start Assessment Test
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recommended */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommend for You:</Text>

            <TouchableOpacity
              style={styles.recommendedCard}
              activeOpacity={0.9}
            >
              <Text style={styles.sectionSubtitle}>Subject:</Text>

              <View style={styles.recommendedContent}>
                <Text style={styles.recommendedText}>
                  Industrial/Organizational Psychology
                </Text>
                <Text style={styles.arrowIcon}>→</Text>
              </View>

              <View style={styles.recommendedBadges}>
                <View style={styles.badgeStartFirst}>
                  <Text style={styles.badgeText}>START FIRST</Text>
                </View>
                <View style={styles.badgeWeak}>
                  <Text style={styles.badgeText}>WEAK</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Continue Reading */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue reading:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.booksContainer}
              contentContainerStyle={styles.booksContentContainer}
            >
              {books.map((book, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.bookCard}
                  activeOpacity={0.8}
                >
                  <View style={styles.bookCover}>
                    <Image
                      source={{ uri: book.image }}
                      style={styles.bookImage}
                    />
                    <View style={styles.bookOverlay}>
                      <Text style={styles.bookTitle} numberOfLines={3}>
                        {book.title}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bookProgressContainer}>
                    <View style={styles.bookProgressBar}>
                      <View
                        style={[
                          styles.bookProgressFill,
                          { width: `${book.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.bookProgressText}>
                      {book.progress}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    paddingVertical: 0, 
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContentSafeArea: {
    paddingVertical: 20,
    paddingBottom: 30, 
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Font applied here
  greeting: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  // Font applied here
  username: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFF",

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Shadow for Android
    elevation: 5,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12, 
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginRight: 5, 
  },
  sectionSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  dayCounter: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: "#666",
  },
  practiceGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  practiceItem: {
    alignItems: "center",
  },
  practiceBox: {
    width: 42,
    height: 58,
    borderRadius: 10,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  practiceCompleted: {
    backgroundColor: "#FFFC98",
    borderColor: ACCENT_COLOR,
  },
  practiceActive: {
    backgroundColor: "#FFF",
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
  },
  // Font applied here
  practiceDay: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: "500",
    color: "#999",
    marginBottom: 3,
  },
  practiceDayDark: {
    color: PRIMARY_COLOR,
  },
  // Font applied here
  practiceDate: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: "700",
    color: "#999",
  },
  practiceDateDark: {
    color: "#000",
  },
  assessmentSection: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  // Font applied here
  assessmentTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  // Font applied here
  assessmentSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 18,
    lineHeight: 18,
  },
  assessmentButton: {
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  // Font applied here
  assessmentButtonText: {
    fontFamily: FONT_FAMILY,
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  recommendedCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendedBadges: {
    flexDirection: "row",
    marginBottom: 10,
  },
  badgeStartFirst: {
    backgroundColor: "#70E3BB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeWeak: {
    backgroundColor: "#FFAEAF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  // Font applied here
  badgeText: {
    fontFamily: "Poppins-Medium", 
    color: "#000000",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  recommendedContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Font applied here
  recommendedText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  arrowIcon: {
    fontSize: 24,
    color: PRIMARY_COLOR,
    marginLeft: 8,
  },
  booksContainer: {
    marginTop: 12,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  booksContentContainer: {
    paddingRight: 20,
  },
  bookCard: {
    marginRight: 15,
    width: 120,
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
  },
  bookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bookOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  // Font applied here
  bookTitle: {
    fontFamily: FONT_FAMILY,
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  bookProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  bookProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginRight: 8,
    overflow: "hidden",
  },
  bookProgressFill: {
    height: "100%",
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 2,
  },
  // Font applied here
  bookProgressText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },
});
