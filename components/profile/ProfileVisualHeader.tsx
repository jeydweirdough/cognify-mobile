import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { useRouter } from "expo-router";

// We no longer need the local asset unless it's a very last resort static image
// const profileAvatar = require("@/assets/images/profile.png");

/**
 * Component to render a placeholder avatar with initials.
 */
interface InitialsAvatarProps {
  initials: string;
  size: number;
}
const InitialsAvatar = ({ initials, size }: InitialsAvatarProps) => (
  <View
    style={[
      styles.initialsAvatar,
      { width: size, height: size, borderRadius: size / 2 },
    ]}
  >
    <Text style={[styles.initialsText, { fontSize: size * 0.4 }]}>
      {initials.toUpperCase()}
    </Text>
  </View>
);

const ProfileVisualHeader = () => {
  const { user } = useAuth();
  const router = useRouter();

  // 1. Get the profile image URL (assuming 'profile_picture' is the key from EditProfileScreen)
  const profileImageUrl = user?.profile_picture;

  // 2. Get initials for the fallback avatar
  const firstNameInitial = user?.first_name?.charAt(0) || "";
  const initials = firstNameInitial;

  // 3. Display names and fallback logic (unchanged from your original logic)
  const fullNameDisplay = user?.first_name ? user.first_name : "User";

  const usernameOrEmailDisplay =
    user?.username && user.username.trim().length > 0
      ? `@${user.username}`
      : "(create username)";

  const userId = user?.id ? String(user.id) : "1";

  return (
    <View style={styles.visualHeaderContainer}>
      <View style={styles.visualHeaderContent}>
        <View style={styles.avatarWrapper}>
          {/* CONDITIONAL RENDERING: Check for image URL first */}
          {profileImageUrl ? (
            <Image
              source={{ uri: profileImageUrl }}
              style={styles.avatarImage}
            />
          ) : (
            // FALLBACK: Render Initials Avatar if no URL is present
            <InitialsAvatar initials={initials} size={112} /> // 120 - 2*4 padding
          )}
        </View>

        <View style={styles.textAndButtonContainer}>
          <Text style={styles.displayName}>{fullNameDisplay}</Text>
          <Text style={styles.username}>{usernameOrEmailDisplay}</Text>

          <Pressable
            style={styles.editProfileButton}
            onPress={() =>
              router.push({
                pathname: "/profile/[id]",
                params: { id: userId },
              })
            }
          >
            <FontAwesome name="edit" size={16} color="#FFF" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

// ... (Styles remain exactly the same as before)
const styles = StyleSheet.create({
  visualHeaderContainer: {
    backgroundColor: "#955FAE",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  visualHeaderContent: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
  },
  // The wrapper defines the overall size and border
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: "#FFF",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    // Add alignment for the InitialAvatar component
    justifyContent: "center",
    alignItems: "center",
  },
  // Style for the actual profile image (fills the wrapper)
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12, // Slightly smaller radius than wrapper for effect
  },
  // NEW STYLE for the Initials Avatar background
  initialsAvatar: {
    backgroundColor: "#d746f7ff", // Gray background as requested
    justifyContent: "center",
    alignItems: "center",
    // Note: size and border radius are set inline in the component call
  },
  // NEW STYLE for the Initials text
  initialsText: {
    color: "#f9eeeeff", // White text
    fontWeight: "bold",
  },
  textAndButtonContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 1,
  },
  username: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 5,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    gap: 8,
    marginTop: 5,
  },
  editProfileButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFF",
  },
});

export default ProfileVisualHeader;
