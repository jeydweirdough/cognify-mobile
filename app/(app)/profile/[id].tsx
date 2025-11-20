import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// --- Import User type from auth lib ---
import { useAuth, User } from "@/lib/auth";

interface ProfileFormState {
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

// --- REFACTORED MODERN INPUT COMPONENT ---
const CustomInput = ({
  label,
  value,
  onChangeText,
  editable = true,
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        !editable && styles.inputDisabled,
      ]}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      
      <TextInput
        style={[styles.input, !editable && styles.inputTextDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#A0A0A0"
      />
    </View>
  );
};

export default function EditProfileScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { user, updateProfile } = auth;

  const [form, setForm] = useState<ProfileFormState>({
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        firstName: user.first_name || "",
        middleName: user.middle_name || "",
        lastName: user.last_name || "",
      });
      setIsDataLoaded(true);
    } else if (auth.initialized) {
      setIsDataLoaded(true);
    }
  }, [user, auth.initialized]);

  const handleSave = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profileUpdates: Partial<User> = {
        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,
      };

      const filteredUpdates: Partial<User> = Object.fromEntries(
        Object.entries(profileUpdates).filter(
          ([_, v]) => v !== null && v !== undefined && v !== ""
        )
      ) as Partial<User>;

      if (Object.keys(filteredUpdates).length > 0) {
        await updateProfile(filteredUpdates);
      }

      router.back();
    } catch (error) {
      console.error("Save failed in component:", error);
    } finally {
      setIsLoading(false);
    }
  }, [form, user, updateProfile, router]);

  if (!isDataLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A73E8" />
          <Text style={{ marginTop: 10, color: "#333" }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: "red" }}>Error: User data is unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <FontAwesome name="angle-left" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {/* UPDATED: Using local asset via require() */}
            <Image 
              source={require("@/assets/images/profile.png")} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editIconBadge}>
              <FontAwesome name="pencil" size={14} color="#333" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{fullName}</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            label="Email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            editable={false}
          />
          
          <CustomInput
            label="First Name"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
          />
          <CustomInput
            label="Middle Name"
            value={form.middleName}
            onChangeText={(text) => setForm({ ...form, middleName: text })}
          />
          <CustomInput
            label="Last Name"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFF",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 8,
    zIndex: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#1A1A1A" },
  scrollContent: { paddingBottom: 40 },
  avatarContainer: { alignItems: "center", marginTop: 30, marginBottom: 24 },
  avatarWrapper: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E1E1E1",
  },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  userName: { fontSize: 18, fontWeight: "600", color: "#000" },
  formContainer: { paddingHorizontal: 24, gap: 16 },
  
  // --- INPUT STYLES ---
  inputContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 60,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
  },
  inputContainerFocused: {
    borderColor: "#1A73E8",
    backgroundColor: "#FFF",
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#EBEBEB",
    opacity: 0.8,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
    padding: 0,
    height: 24,
  },
  inputTextDisabled: {
    color: "#888",
  },

  // --- BUTTON STYLES ---
  saveButton: {
    backgroundColor: "#955FAE",
    marginHorizontal: 24,
    height: 54,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    shadowColor: "#955FAE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});