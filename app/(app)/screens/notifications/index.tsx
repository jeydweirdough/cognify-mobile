import Header from "@/components/ui/header";
import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Colors = {
  background: "#F4F6F9", // Slightly cooler gray for a modern feel
  white: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#666666",
  textTertiary: "#999999",
  primary: "#6A2A94",
  border: "#EFF0F6",
};

const Fonts = {
  semiBold: "LexendDeca-Medium",
};

// Interface for props
interface NotificationCardProps {
  icon: keyof typeof Feather.glyphMap;
  color: string;
  title: string;
  subtitle: string;
  time: string;
  isNew?: boolean;
}

// Reusable Card Component
const NotificationCard = ({
  icon,
  color,
  title,
  subtitle,
  time,
  isNew,
}: NotificationCardProps) => (
  <View style={[styles.card, isNew && styles.cardNew]}>
    {/* Dynamic background color based on the icon color (using opacity) */}
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      <Feather name={icon} size={22} color={color} />
    </View>
    <View style={styles.cardContent}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardTime}>{time}</Text>
      </View>
      <Text style={styles.cardSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </View>
    {isNew && <View style={styles.newIndicator} />}
  </View>
);

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Notifications" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* NEW SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>New</Text>

          <NotificationCard
            icon="book-open"
            color="#FF9F1C"
            title="New Study Material"
            subtitle="Developmental Psychology • A new lecture has been added."
            time="2h"
            isNew={true}
          />

          <NotificationCard
            icon="bell"
            color="#E83F5B"
            title="Diagnostic Result"
            subtitle="View your subject recommendations based on your assessment."
            time="1d"
            isNew={true}
          />

          <NotificationCard
            icon="check-circle"
            color="#2E7D32"
            title="Quiz Due Tomorrow"
            subtitle="Abnormal Psychology • Anxiety Disorders module quiz is due."
            time="1d"
            isNew={true}
          />
        </View>

        {/* EARLIER SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Earlier</Text>

          <NotificationCard
            icon="file-text"
            color="#6A2A94"
            title="Subject Progress Updated"
            subtitle="Industrial-Organizational Psychology • Reading progress saved."
            time="3d"
          />

          <NotificationCard
            icon="bar-chart-2"
            color="#FFC107"
            title="Analytics Report Generated"
            subtitle="Your subject performance analytics have been refreshed."
            time="6d"
          />

          <NotificationCard
            icon="user"
            color="#5C5C5C"
            title="Profile Updated"
            subtitle="Your account details were successfully updated."
            time="13d"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  // Card Styles
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  cardNew: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: "500",
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  newIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    opacity: 0, // Set to 1 if you want a red dot indicator
  },
});
 