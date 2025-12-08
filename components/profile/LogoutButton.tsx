import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface LogoutButtonProps {
  onPress: () => void;
}

const LogoutButton = ({ onPress }: LogoutButtonProps) => (
  <Pressable style={styles.logoutButton} onPress={onPress}>
    <FontAwesome name="sign-out" size={16} color="#D32F2F" />
    <Text style={styles.logoutButtonText}>Log Out</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE", // Pastel Red
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    // Removed border for a cleaner look, added shadow
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D32F2F",
    fontFamily: "LexendDeca-Regular",
  },
});

export default LogoutButton;
