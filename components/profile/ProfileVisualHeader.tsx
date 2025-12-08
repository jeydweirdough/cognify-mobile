import { useAuth } from "@/lib/auth";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  onEditPress: () => void;
  isUploading?: boolean;
}

const Colors = {
  primary: "#48316D", // Deep Brand Purple
  white: "#FFFFFF",
  gold: "#FFD700",
  textMuted: "rgba(255, 255, 255, 0.7)",
};

const ProfileVisualHeader = ({ onEditPress, isUploading = false }: Props) => {
  const { user } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const wasUploading = useRef(isUploading);

  useEffect(() => {
    if (wasUploading.current && !isUploading) {
      setShowSuccessModal(true);
    }
    wasUploading.current = isUploading;
  }, [isUploading]);

  const profileImageUrl = user?.profile_picture;
  const firstNameInitial = user?.first_name?.charAt(0) || "U";
  const fullNameDisplay = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`
    : "Student";
  const usernameOrEmailDisplay = user?.username
    ? `@${user.username}`
    : "@future_rpm";

  return (
    <View style={styles.container}>
      {/* --- SUCCESS MODAL --- */}
      <Modal
        transparent={true}
        visible={showSuccessModal}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <FontAwesome5
                name="check-circle"
                size={48}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.modalTitle}>Upload Complete!</Text>
            <Text style={styles.modalMessage}>
              Your profile picture has been successfully updated.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Awesome</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}

          {!isUploading && (
            <View style={styles.editIconContainer}>
              <FontAwesome5 name="pen" size={10} color={Colors.primary} />
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
            <FontAwesome5
              name="crown"
              size={10}
              color={Colors.gold}
              style={{ marginRight: 6 }}
            />
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
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    // Deep purple shadow
    shadowColor: "#2D1F2C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(45, 31, 44, 0.6)", // Dark purple tint overlay
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 16,
    backgroundColor: "#F3E5F5",
    padding: 16,
    borderRadius: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D1F2C",
    marginBottom: 8,
    fontFamily: "LexendDeca-Regular",
  },
  modalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: "LexendDeca-Regular",
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "LexendDeca-Regular",
  },
  // --- Avatar ---
  avatarWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    marginRight: 20,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  initialsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF8A65", // Warm pastel orange/coral
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  initialsText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 32,
    fontFamily: "LexendDeca-Regular",
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
    borderColor: Colors.primary,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  // --- Text Info ---
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  displayName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 4,
    fontFamily: "LexendDeca-Regular",
  },
  username: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 12,
    fontFamily: "LexendDeca-Regular",
  },
  // --- Badge ---
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 0.5,
    fontFamily: "LexendDeca-Regular",
  },
});

export default ProfileVisualHeader;
