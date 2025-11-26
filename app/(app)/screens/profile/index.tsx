import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
// Import useAuth
import { useAuth } from "@/lib/auth";

import Header from "@/components/ui/header";
import ProfileVisualHeader from "@/components/profile/ProfileVisualHeader";
import ProfileMenu from "@/components/profile/ProfileMenu";
import PersonalNoteCard from "@/components/profile/PersonalNoteCard";
import EditPersonalNoteModal from "@/components/profile/EditPersonalNoteModal";

export default function ProfileScreen() {
  // Get the navigation object
  const navigation = useNavigation();
  // Use the useAuth hook to get the logout function
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState("Morning, gising na ang papasa sa board.");
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>

      <Header title="Profile" />

      <ScrollView style={{ flex: 1 }}>

        <ProfileVisualHeader />

        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <PersonalNoteCard note={note} onEdit={() => setModalVisible(true)} />
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          {!isEditing && (
            <ProfileMenu onLogout={logout} navigation={navigation} />
          )}
        </View>
      </ScrollView>

      <EditPersonalNoteModal
        visible={modalVisible}
        value={note}
        onClose={() => setModalVisible(false)}
        onSave={(text) => setNote(text)}
      />
    </SafeAreaView>
  );
}