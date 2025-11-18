import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileMenu({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.container}>
      <MenuItem label="My Account" icon="settings-outline" />
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
