import Header from "@/components/ui/header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SupportScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Help & Support" />
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.navigate('/screens/profile')} // Forces route to Profile page
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.heading}>Contact Us</Text>
          <Text style={styles.description}>
            Having trouble? Email our support team and we'll get back to you shortly.
          </Text>
          
          <TouchableOpacity style={styles.button}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.btnText}>support@schoolapp.com</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FB" },
  headerContainer: { position: 'relative' },
  backButton: {
    position: "absolute",
    left: 20,
    bottom: 15,
    zIndex: 10,
  },
  content: { padding: 20 },
  card: { backgroundColor: "#fff", padding: 24, borderRadius: 16, alignItems: "center" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  description: { textAlign: "center", color: "#666", marginBottom: 20, lineHeight: 22 },
  button: { 
    flexDirection: 'row', 
    backgroundColor: "#3D365C", 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: "center", 
    gap: 2
  },
  btnText: { color: "#fff", fontWeight: "600" }
});