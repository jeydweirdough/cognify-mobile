import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Colors = {
  text: "#2D1F2C", // Dark purple/black text
  cardBg: "#FFF9E6", // Cream/Yellow tint matching "Daily Goal"
  border: "#EAD4AA", // Soft gold/tan border
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
  { id: "streak", iconName: "zap", value: "0", label: "Days Streak" },
  {
    id: "lessons",
    iconName: "check-circle",
    value: "0",
    label: "Lessons Completed",
  },
  { id: "exams", iconName: "clock", value: "0", label: "Exams Completed" },
];

interface AchievementItemProps {
  iconName: keyof typeof Feather.glyphMap;
  text: string;
}

const AchievementItem: React.FC<AchievementItemProps> = ({
  iconName,
  text,
}) => (
  <View style={styles.itemRow}>
    <Feather
      name={iconName}
      size={20}
      color={Colors.text}
      style={styles.icon}
    />
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
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // spacing between rows
  },
  icon: {
    marginRight: 12,
    opacity: 0.8,
  },
  itemText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.text,
  },
});
