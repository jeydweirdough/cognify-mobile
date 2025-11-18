import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface LogoutButtonProps {
  onPress: () => void;
}

const LogoutButton = ({ onPress }: LogoutButtonProps) => (
  <Pressable style={styles.logoutButton} onPress={onPress}>
    <FontAwesome name="sign-out" size={16} color="#FF5C5C" />
    <Text style={styles.logoutButtonText}>Logout</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FF5C5C",
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF5C5C",
  },
});

export default LogoutButton;
