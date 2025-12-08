import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onLogout: () => void;
}

export default function ProfileMenu({ onLogout }: Props) {
  const router = useRouter();

  // Reusable Row Component
  const MenuRow = ({
    label,
    icon,
    color,
    bgColor,
    route,
    isDestructive,
    onPress,
    isLast,
  }: any) => {
    const handlePress = onPress || (() => (route ? router.push(route) : null));

    return (
      <TouchableOpacity
        style={[styles.row, isLast && styles.lastRow]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Icon Bubble */}
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>

        {/* Text Content */}
        <View style={styles.content}>
          <Text
            style={[styles.label, isDestructive && styles.destructiveLabel]}
          >
            {label}
          </Text>
        </View>

        {/* Chevron (Hidden for Logout/Destructive items usually, or keep consistent) */}
        {!isDestructive ? (
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuWrapper}>
        <MenuRow
          label="My Account"
          icon="person"
          color="#3B82F6" // Blue
          bgColor="#EFF6FF" // Pastel Blue
          route="/profile/my-account"
        />

        <MenuRow
          label="Offline Materials"
          icon="cloud-download"
          color="#10B981" // Green
          bgColor="#ECFDF5" // Pastel Green
          route="/profile/offline-materials"
        />

        <MenuRow
          label="Help & Support"
          icon="help-buoy"
          color="#F59E0B" // Orange
          bgColor="#FFFBEB" // Pastel Orange
          route="/profile/help-support"
        />

        {/* Logout is now part of the list */}
        <MenuRow
          label="Log Out"
          icon="log-out-outline"
          color="#a10d0dff" // Red Icon
          bgColor="#FEF2F2" // Pastel Red BG
          onPress={onLogout}
          isDestructive
          isLast // Removes the border bottom
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 40,
  },
  // The single container for all items
  menuWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden", // Ensures children don't bleed out of rounded corners

    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,

    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  // Row Styles
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", // Light divider
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  // Icon Styles
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    fontFamily: "LexendDeca-Medium",
  },
  destructiveLabel: {
    color: "#c42121ff", // Red text for Logout
  },
});
