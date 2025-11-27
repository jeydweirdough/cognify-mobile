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
  Animated,
  Dimensions,
  Alert, // Added Alert for permission issues
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// --- Import ImagePicker ---
import * as ImagePicker from 'expo-image-picker';
// --- Import User type from auth lib ---
import { useAuth } from "@/lib/auth";

// Define the Student interface based on the provided User type structure
export interface Student {
  // Add actual student fields here if needed, otherwise leave blank or define core ones
  pre_assessment_score?: number;
  ai_confidence?: number;
  // ... other student-specific fields
}

// Define the User interface (moved here for completeness, though it should be in "@/lib/auth")
// Assuming this is the definition from the bottom of the original prompt:
export interface User {
  id: string;
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  username?: string; 
  role_id?: string;
  fcm_token?: string;
  is_verified: boolean;
  verified_at?: string;
  profile_image?: string; // Standard profile image URL field
  profile_picture?: string; // Alternative profile image URL field
  is_registered: boolean;
  created_at?: string;
  updated_at?: string;
  student_info?: Student;
}

// --- New Interface for Toast Props to fix implicit 'any' errors (7031) ---
interface ToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: (wasSuccessful: boolean) => void; 
  type: 'success' | 'error';
}

const windowWidth = Dimensions.get("window").width;

// --- Custom Toast Component (Modified to accept 'type') ---
const Toast = ({ message, isVisible, onDismiss, type }: ToastProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));
  const backgroundColor = type === 'success' ? '#1A73E8' : '#D93025'; 
  
  const [finishedTimeout, setFinishedTimeout] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (isVisible) {
      setFinishedTimeout(false); 
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        timer = setTimeout(() => {
          setFinishedTimeout(true);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateAnim, {
              toValue: 50,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => onDismiss(true)); 
        }, 3000);
      });
    }

    return () => {
      if (timer) clearTimeout(timer); 
    };
  }, [isVisible, fadeAnim, translateAnim, onDismiss]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        toastStyles.container,
        {
          backgroundColor: backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      <Text style={toastStyles.text}>{message}</Text>
    </Animated.View>
  );
};

const toastStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 999,
    maxWidth: windowWidth * 0.7,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: "#FFF",
    fontWeight: "600",
  },
});
// --- End of Toast Component ---


interface ProfileFormState {
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  username: string; 
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
  // Ensure useAuth provides a way to access the current user's data
  const auth = useAuth();
  // The 'user' object is where the profile image URL must be stored (e.g., user.profile_picture)
  const { user, updateProfile } = auth; 

  const [form, setForm] = useState<ProfileFormState>({
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    username: "", 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- TOAST STATE ---
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  // -------------------
  
  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        firstName: user.first_name || "",
        middleName: user.middle_name || "",
        lastName: user.last_name || "",
        username: user.username || "", 
      });
      setIsDataLoaded(true);
    } else if (auth.initialized) {
      setIsDataLoaded(true);
    }
  }, [user, auth.initialized]);

  const handleToastDismiss = useCallback((wasSuccessful: boolean) => {
    setShowToast(false);
    if (wasSuccessful && toastType === 'success' && toastMessage === "Profile updated successfully!") {
      // Navigate only for successful name/username updates
      router.replace("/screens/profile"); 
    }
  }, [router, toastType, toastMessage]);


  // 🌟 NEW FUNCTION: Handles image selection and update 🌟
  const handleImagePick = useCallback(async () => {
    if (isLoading) return;

    // 1. Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Permission Required", 
        "Permission to access the media library is needed to set a new profile picture."
      );
      return;
    }

    // 2. Launch the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [1, 1],
      quality: 0.5, 
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return; // User cancelled
    }
    
    const newImageUri = result.assets[0].uri;
    
    setIsLoading(true);
    setShowToast(false); // Hide any previous toast
    
    try {
      // 3. ⚠️ IMPORTANT: Placeholder for Image Upload API Call
      
      // In a real app, you would:
      // a) Create a FormData object.
      // b) Upload the image file (newImageUri) to your backend storage (e.g., AWS S3, Firebase).
      // c) Receive the permanent public URL for the new image (e.g., 'https://yourcdn.com/new-profile.jpg').

      // SIMULATION: Wait a moment and assume the local URI is the new public URL for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const newProfileUrl = newImageUri; // Replace this with the URL returned by your actual API

      // 4. Update the user profile with the new image URL
      const profileUpdates: Partial<User> = {
        // Use the key that your backend expects for the profile picture URL
        profile_picture: newProfileUrl, 
      };

      await updateProfile(profileUpdates);
      
      // Show success toast
      setToastMessage("Profile picture updated successfully!");
      setToastType('success');
      setShowToast(true);

    } catch (error) {
      console.error("Image update failed in component:", error);
      // Show error toast
      setToastMessage("Failed to update profile picture. Please try again.");
      setToastType('error');
      setShowToast(true);
      
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, updateProfile]);

  const handleSave = useCallback(async () => {
    if (!user) return;

    setShowToast(false);
    setIsLoading(true);
    try {
      const profileUpdates: Partial<User> = {
        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,
        username: form.username, 
      };

      const filteredUpdates: Partial<User> = Object.fromEntries(
        Object.entries(profileUpdates).filter(
          ([key, v]) => 
            v !== null && 
            v !== undefined && 
            v !== "" &&
            // Compare against current user state to detect actual changes
            v !== user[key as keyof User] 
        )
      ) as Partial<User>;

      if (Object.keys(filteredUpdates).length > 0) {
        await updateProfile(filteredUpdates);
        setToastMessage("Profile updated successfully!");
        setToastType('success');
        setShowToast(true);
        
      } else {
        setToastMessage("No changes detected.");
        setToastType('error');
        setShowToast(true);
      }

    } catch (error) {
      console.error("Save failed in component:", error);
      setToastMessage("Failed to update profile. Please try again.");
      setToastType('error');
      setShowToast(true);

    } finally {
      setIsLoading(false);
    }
  }, [form, user, updateProfile]);

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

  // Determine the image source: dynamic URL first, then local fallback
  const avatarSource = 
    user.profile_picture // Check 'profile_picture' field
    ? { uri: user.profile_picture }
    : user.profile_image // Check 'profile_image' field (if applicable)
    ? { uri: user.profile_image }
    : require("@/assets/images/profile.png"); // Local asset fallback

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
            {/* UPDATED: Dynamic image source */}
            <Image
              source={avatarSource}
              style={styles.avatar}
            />
            {/* UPDATED: Added onPress handler to the pencil icon */}
            <TouchableOpacity 
              style={styles.editIconBadge}
              onPress={handleImagePick} // <--- HANDLER ADDED HERE
              disabled={isLoading} // Disable while image is loading/uploading
            >
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
            label="Username" 
            value={form.username} 
            onChangeText={(text) => setForm({ ...form, username: text })} 
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

      {/* --- TOAST COMPONENT RENDERED HERE --- */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onDismiss={handleToastDismiss}
        type={toastType}
      />
      {/* ------------------------------------ */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Style definitions from the original prompt)
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