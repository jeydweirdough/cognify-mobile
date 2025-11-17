import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const Colors = {
  text: "#000", 
  cardBg: "#F4FFCC",
  border: "#838383", // subtle border
};

const Fonts = {
  regular: "LexendDeca-Regular", 
};

type Achievement = {
  id: string;
  iconName: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: "streak", iconName: "zap", value: "7", label: "Days Streak" },
  { id: "lessons", iconName: "check-circle", value: "4", label: "Lessons Completed" },
  { id: "exams", iconName: "clock", value: "5", label: "Exams Completed" },
];

interface AchievementItemProps {
  iconName: keyof typeof Feather.glyphMap;
  text: string;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ iconName, text }) => (
  <View style={styles.itemRow}>
    <Feather name={iconName} size={20} color={Colors.text} style={styles.icon} />
    <Text style={styles.itemText}>{text}</Text>
  </View>
);

export const AchievementsCard: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Achievements</Text>
    <View style={styles.card}>
      {MOCK_ACHIEVEMENTS.map((item) => (
        <AchievementItem
          key={item.id}
          iconName={item.iconName}
          text={`${item.value} ${item.label}`}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // spacing between rows
  },
  icon: {
    marginRight: 10,
  },
  itemText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.text,
  },
});
