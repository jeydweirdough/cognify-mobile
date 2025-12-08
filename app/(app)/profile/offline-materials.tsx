import Header from "@/components/ui/header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OfflineMaterials() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Offline Materials" />
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.navigate('/screens/profile')} // Forces route to Profile page
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.emptyState}>
        <Ionicons name="cloud-offline-outline" size={64} color="#D1D1D6" />
        <Text style={styles.emptyText}>No downloaded materials yet.</Text>
        <Text style={styles.subText}>Materials you save will appear here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: { position: 'relative' },
  backButton: {
    position: "absolute",
    left: 20,
    bottom: 15,
    zIndex: 10,
  },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#333", marginTop: 16 },
  subText: { fontSize: 14, color: "#8E8E93", marginTop: 8 }
});