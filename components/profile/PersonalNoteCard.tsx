import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  note: string;
  onEdit: () => void;
}

const Colors = {
  bg: "#FFF9E6", // Soft Cream/Yellow matching Daily Goal
  border: "#F5E6C8", // Soft tan border
  textDark: "#4A3B32", // Darker brown/grey for readability
  iconColor: "#F59E0B",
  iconBg: "rgba(245, 158, 11, 0.12)",
};

export default function PersonalNoteCard({ note, onEdit }: Props) {
  return (
    <Pressable onPress={onEdit} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="bullseye-arrow"
              size={20}
              color={Colors.iconColor}
            />
          </View>
          <Text style={styles.headerTitle}>Daily Goal</Text>
        </View>

        <Text style={styles.noteText} numberOfLines={3}>
          {note || "Set a goal to keep yourself motivated!"}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.tapText}>Tap to edit</Text>
          <Ionicons name="pencil" size={12} color={Colors.iconColor} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.bg,
    borderRadius: 15,
    padding: 20,
    // Consistent Soft Shadow
    shadowColor: "#683d0dff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: Colors.iconBg,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B45309",
    fontFamily: "LexendDeca-Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 15,
    color: Colors.textDark,
    lineHeight: 24,
    fontFamily: "LexendDeca-Regular",
    marginBottom: 16,
    textAlign: "center", // Changed to left for better reading
    paddingHorizontal: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    opacity: 0.8,
  },
  tapText: {
    fontSize: 12,
    color: "#B45309",
    fontWeight: "600",
    fontFamily: "LexendDeca-Regular",
  },
});
