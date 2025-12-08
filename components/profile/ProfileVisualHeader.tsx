import { useAuth } from "@/lib/auth";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal, // Import Modal
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

  // State for the success popup
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Track previous uploading state
  const wasUploading = useRef(isUploading);

  useEffect(() => {
    // If it WAS uploading and now is NOT, show the success modal
    if (wasUploading.current && !isUploading) {
      setShowSuccessModal(true);
    }
    wasUploading.current = isUploading;
  }, [isUploading]);

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
      {/* --- CUSTOM ALERT MODAL --- */}
      <Modal
        transparent={true}
        visible={showSuccessModal}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <FontAwesome5 name="check-circle" size={40} color="#10B981" />
            </View>
            <Text style={styles.modalTitle}>Upload Complete</Text>
            <Text style={styles.modalMessage}>
              Your profile picture has been successfully updated.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
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
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#3D365C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dim background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxWidth: 320,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: "#3D365C", // Theme color
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: "#FF6B6B", 
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
    borderColor: "#3D365C",
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
    borderColor: "rgba(255,215,0,0.1)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

export default ProfileVisualHeader;
