import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Add navigation prop
export default function ProfileMenu({ onLogout, navigation }: { onLogout: () => void, navigation: any }) {
  // Define the navigation handler for My Account
  const handleMyAccountPress = () => {
    // Navigate to the profile route with a placeholder ID (e.g., '123')
    // Replace '123' with the actual user ID when available
    navigation.navigate("/profile/[id]");
  };

  return (
    <View style={styles.container}>
      {/* 1. Add onPress prop to My Account and link it to the handler */}
      <MenuItem 
        label="My Account" 
        icon="settings-outline" 
        onPress={handleMyAccountPress} 
      />
      <MenuItem label="Offline Materials" icon="settings-outline" />
      <MenuItem label="Progress Overview" icon="settings-outline" />
      <MenuItem label="Help and Support" icon="settings-outline" />

      <MenuItem
        label="Logout"
        icon="settings-outline"
        onPress={onLogout}
      />
    </View>
  );
}

// ... MenuItem and styles remain the same ...

function MenuItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: any;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color="#000" />
        <Text style={styles.label}>{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#777" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#838383",
    borderRadius: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    marginTop: 15,
    backgroundColor: "#FFFFFF",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 25,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  label: {
    fontSize: 16,
    color: "#1f2844ff",
    fontWeight: "500",
  },
});