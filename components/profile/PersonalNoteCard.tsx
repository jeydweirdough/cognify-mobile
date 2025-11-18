import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  note: string;
  onEdit: () => void;
}

export default function PersonalNoteCard({ note, onEdit }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Personal Note:</Text>

      <Text style={styles.note}>{note}</Text>

      <Pressable style={styles.editBtn} onPress={onEdit}>
        <Ionicons name="create-outline" size={20} color="#333" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F4FFCC",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    marginTop: 1,
    position: "relative",
    borderColor: "#838383",
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    color: "#6B6B6B",
    textAlign: "center",
    marginBottom: 10,
    marginTop: -10,
    fontWeight: "500",
  },
  note: {
    fontSize: 16,
    textAlign: "center",
    color: "#000",
    lineHeight: 30,
    paddingHorizontal: 30,
  },
  editBtn: {
    position: "absolute",
    right: 14,
    bottom: 10,
  },
});
