import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import type { User } from "@/lib/types";

const profileAvatar = require("@/assets/images/profile.png");

interface ProfileVisualHeaderProps {
  user: User | null;
  
}

const ProfileVisualHeader = ({ user }: ProfileVisualHeaderProps) => {
  const displayName = user?.first_name || "Guest User";
  const usernameDisplay = user?.email ? `@${user.email.split("@")[0]}` : "@username";

  return (
    <View style={styles.visualHeaderContainer}>
      <View style={styles.visualHeaderContent}>
        <View style={styles.avatarWrapper}>
          <Image source={profileAvatar} style={styles.avatarImage} />
        </View>

        <View style={styles.textAndButtonContainer}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.username}>{usernameDisplay}</Text>

          {/* 👇 ALWAYS visible now */}
          <Pressable style={styles.editProfileButton}>
            <FontAwesome name="edit" size={16} color="#FFF" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  visualHeaderContainer: {
    backgroundColor: '#955FAE',
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
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
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
