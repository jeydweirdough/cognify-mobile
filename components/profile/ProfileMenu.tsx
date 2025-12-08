import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
    iconName,
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
        {/* Icon Bubble - Now a Squircle */}
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <MaterialCommunityIcons name={iconName} size={24} color={color} />
        </View>

        {/* Text Content */}
        <View style={styles.content}>
          <Text
            style={[styles.label, isDestructive && styles.destructiveLabel]}
          >
            {label}
          </Text>
        </View>

        {/* Chevron - Only show if NOT destructive (hidden for Log Out) */}
        {!isDestructive && (
          <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuWrapper}>
        <MenuRow
          label="My Account"
          iconName="account-circle-outline" // Enhanced User Icon
          color="#3B82F6" // Blue Text
          bgColor="#EFF6FF" // Pastel Blue BG
          route="/profile/my-account"
        />

        <MenuRow
          label="Offline Materials"
          iconName="book-arrow-down-outline" // Specific "Study Material" Icon
          color="#10B981" // Green Text
          bgColor="#ECFDF5" // Pastel Green BG
          route="/profile/offline-materials"
        />

        <MenuRow
          label="Help & Support"
          iconName="face-agent" // Classic Support Icon
          color="#F59E0B" // Orange Text
          bgColor="#FFFBEB" // Pastel Cream/Orange BG
          route="/profile/help-support"
        />

        <MenuRow
          label="Log Out"
          iconName="logout-variant" // Clear Exit Icon
          color="#EF4444" // Red Text
          bgColor="#FEF2F2" // Pastel Red BG
          onPress={onLogout}
          isDestructive
          isLast
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
  menuWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // Smoother corners
    overflow: "hidden",
    // Soft, elevated shadow
    shadowColor: "#48316D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 2,
    borderBottomColor: "#F8FAFC",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 48, // Slightly larger
    height: 48,
    borderRadius: 16, // Squircle shape (Rounded Square)
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16, // Slightly larger text
    fontWeight: "500",
    color: "#1E293B", // Deep slate text
    fontFamily: "LexendDeca-Regular",
    letterSpacing: -0.2,
  },
  destructiveLabel: {
    color: "#EF4444",
  },
});
