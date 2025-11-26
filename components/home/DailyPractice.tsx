import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  FONT_FAMILY,
  PRIMARY_COLOR,
  ACCENT_COLOR,
  BACKGROUND_COLOR,
} from "@/constants/cognify-theme";

// Helper to get day initials
const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

// Generate weekly practice dynamically
const generateWeeklyPractice = () => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay()); // start from Sunday

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      day: daysOfWeek[date.getDay()],
      date: date.getDate(),
      active: date.toDateString() === today.toDateString(),
      completed: date < today,
    };
  });
};

export default function DailyPractice() {
  const dailyPractice = generateWeeklyPractice();
  const todayIndex = dailyPractice.findIndex((item) => item.active);
  const dayCounter = todayIndex + 1;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Practice</Text>
        <Text style={styles.dayCounter}>Day {dayCounter}</Text>
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
                  (item.completed || item.active) && styles.practiceDayDark,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.practiceDate,
                  (item.completed || item.active) && styles.practiceDateDark,
                ]}
              >
                {item.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
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
  dayCounter: { fontFamily: FONT_FAMILY, fontSize: 13, color: "#666" },
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
  practiceItem: { alignItems: "center" },
  practiceBox: {
    width: 40,
    height: 60,
    borderRadius: 10,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  practiceCompleted: { backgroundColor: "#FFFC98", borderColor: ACCENT_COLOR },
  practiceActive: {
    backgroundColor: "#FFF",
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
  },
  practiceDay: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: "500",
    color: "#999",
    marginBottom: 3,
  },
  practiceDayDark: { color: PRIMARY_COLOR },
  practiceDate: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: "700",
    color: "#999",
  },
  practiceDateDark: { color: "#000" },
});
