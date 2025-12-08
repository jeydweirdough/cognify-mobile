import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  note: string;
  onEdit: () => void;
}

export default function PersonalNoteCard({ note, onEdit }: Props) {
  return (
    <Pressable onPress={onEdit} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="target" size={18} color="#D97706" />
          </View>
          <Text style={styles.headerTitle}>Daily Goal</Text>
        </View>

        <Text style={styles.noteText} numberOfLines={3}>
          {note || "Set a goal to keep yourself motivated!"}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.tapText}>Tap to edit</Text>
          <Ionicons name="pencil" size={12} color="#B45309" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFBEB", // Warm Cream
    borderRadius: 16, // Consistent Radius
    padding: 20,

    // Consistent Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,

    borderWidth: 1,
    borderColor: "#FEF3C7", // Subtle yellow border
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(217, 119, 6, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D97706",
    fontFamily: "LexendDeca-Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 14,
    color: "#451A03",
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "LexendDeca-Regular",
    marginBottom: 12,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    opacity: 0.7,
  },
  tapText: {
    fontSize: 11,
    color: "#B45309",
    fontWeight: "600",
  },
});
