import { useAuth } from "@/lib/auth";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  onEditPress: () => void;
  isUploading?: boolean;
}

const ProfileVisualHeader = ({ onEditPress, isUploading = false }: Props) => {
  const { user } = useAuth();

  const profileImageUrl = user?.profile_picture;
  const firstNameInitial = user?.first_name?.charAt(0) || "U";
  const fullNameDisplay = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`
    : "User";
  const usernameOrEmailDisplay = user?.username
    ? `@${user.username}`
    : "@student";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Avatar Section */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={onEditPress}
          disabled={isUploading}
          activeOpacity={0.8}
        >
          {profileImageUrl ? (
            <Image
              source={{ uri: profileImageUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>
                {firstNameInitial.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Loading Overlay */}
          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#333" />
            </View>
          )}

          {/* Edit Pencil Badge */}
          {!isUploading && (
            <View style={styles.editIconContainer}>
              <FontAwesome5 name="pen" size={10} color="#3D365C" />
            </View>
          )}
        </TouchableOpacity>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.displayName} numberOfLines={1}>
            {fullNameDisplay}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            {usernameOrEmailDisplay}
          </Text>

          {/* Badge */}
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Future RPm</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#3D365C",
    borderRadius: 16, // UPDATED: Consistent 16px radius
    padding: 24,
    flexDirection: "row",
    alignItems: "center",

    // Consistent Shadow
    shadowColor: "#3D365C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // --- Avatar ---
  avatarWrapper: {
    position: "relative",
    width: 84,
    height: 84,
    marginRight: 20,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
  },
  initialsAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FF6B6B", // Vibrant Coral
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
  },
  initialsText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 34,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3D365C", // Blend with bg
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  // --- Text Info ---
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  username: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 12,
    fontWeight: "500",
  },
  // --- Badge ---
  badgeContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.1)", // Subtle gold border
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFD700", // Gold
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

export default ProfileVisualHeader;
