import { useAuth } from "@/lib/auth";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EditPersonalNoteModal from "@/components/profile/EditPersonalNoteModal";
import PersonalNoteCard from "@/components/profile/PersonalNoteCard";
import ProfileMenu from "@/components/profile/ProfileMenu";
import ProfileVisualHeader from "@/components/profile/ProfileVisualHeader";
import Header from "@/components/ui/header";

export default function ProfileScreen() {
  const { logout, updateProfile } = useAuth();

  const [note, setNote] = useState("Morning, gising na ang papasa sa board.");
  const [modalVisible, setModalVisible] = useState(false);

  // NEW: State for the custom logout modal
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  // --- Photo Upload Logic ---
  const handleDirectImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Platform.OS === "web"
        ? alert("Permission Required: We need access to your photos.")
        : Alert.alert("Permission Required", "We need access to your photos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setIsUploading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await updateProfile({ profile_picture: selectedUri });

        Platform.OS === "web"
          ? alert("Profile photo updated!")
          : Alert.alert("Success", "Profile photo updated!");
      } catch (error) {
        console.error(error);
        alert("Failed to update profile picture.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // --- LOGOUT HANDLER ---
  const handleLogoutPress = () => {
    // Instead of Alert.alert, we show our custom modal
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    // Add a small delay for animation smoothness
    setTimeout(() => {
      logout();
    }, 200);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      {" "}
      {/* Match Home Bg */}
      <Header title="Profile" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <ProfileVisualHeader
            onEditPress={handleDirectImagePick}
            isUploading={isUploading}
          />

          <PersonalNoteCard note={note} onEdit={() => setModalVisible(true)} />

          <ProfileMenu onLogout={handleLogoutPress} />
        </View>
      </ScrollView>
      {/* Note Editor Modal */}
      <EditPersonalNoteModal
        visible={modalVisible}
        value={note}
        onClose={() => setModalVisible(false)}
        onSave={(text) => setNote(text)}
      />
      {/* --- CUSTOM LOGOUT MODAL --- */}
      <Modal
        transparent
        visible={logoutModalVisible}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLES FOR THE CUSTOM MODAL ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent dark background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1A1A1A",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#F2F2F2",
  },
  confirmBtn: {
    backgroundColor: "#c24942ff",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
