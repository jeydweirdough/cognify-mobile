import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// 1. Import useNavigation from React Navigation
import { useNavigation } from "@react-navigation/native"; 

import Header from "@/components/ui/header";
import ProfileVisualHeader from "@/components/profile/ProfileVisualHeader";
import ProfileMenu from "@/components/profile/ProfileMenu";
import PersonalNoteCard from "@/components/profile/PersonalNoteCard";
import EditPersonalNoteModal from "@/components/profile/EditPersonalNoteModal";

export default function ProfileScreen() {
  // 2. Get the navigation object
  const navigation = useNavigation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState("Morning, gising na ang papasa sa board.");
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <ScrollView style={{ flex: 1 }}>
        <Header title="Profile" />

        {/* FIXED: Removed 'user={null}' */}
        <ProfileVisualHeader />

        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <PersonalNoteCard
            note={note}
            onEdit={() => setModalVisible(true)}
          />
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {/* 3. Pass the navigation object to ProfileMenu */}
          {!isEditing && <ProfileMenu onLogout={() => {}} navigation={navigation} />}
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