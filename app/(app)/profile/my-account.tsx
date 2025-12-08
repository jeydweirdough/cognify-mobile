import Header from "@/components/ui/header";
import { useAuth } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// --- Types ---
interface User {
  id: string;
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  username?: string;
  [key: string]: any;
}

interface ProfileFormState {
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
}

// --- Toast Component ---
const windowWidth = Dimensions.get("window").width;
interface ToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: (wasSuccessful: boolean) => void;
  type: "success" | "error";
}

const Toast = ({ message, isVisible, onDismiss, type }: ToastProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));
  const backgroundColor = type === "success" ? "#1A73E8" : "#D93025";

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isVisible) {
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
          backgroundColor,
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
  },
  text: { color: "#FFF", fontWeight: "600" },
});

// --- Custom Input Row (Designed to look like a Settings List Item) ---
interface InputRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  isLast?: boolean;
}

const InputRow = ({
  label,
  value,
  onChangeText,
  editable = true,
  isLast = false,
}: InputRowProps) => (
  <View style={[styles.inputRow, !isLast && styles.inputBorder]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.inputValue, !editable && styles.inputTextDisabled]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      placeholder="Not set"
      placeholderTextColor="#C7C7CC"
      textAlign="right"
    />
  </View>
);

export default function MyAccountScreen() {
  const router = useRouter();
  const { user, updateProfile, initialized } = useAuth();

  const [form, setForm] = useState<ProfileFormState>({
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

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
    } else if (initialized) {
      setIsDataLoaded(true);
    }
  }, [user, initialized]);

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
            v !== user[key as keyof User]
        )
      ) as Partial<User>;

      if (Object.keys(filteredUpdates).length > 0) {
        await updateProfile(filteredUpdates);
        setToastMessage("Changes saved!");
        setToastType("success");
        setShowToast(true);
      } else {
        setToastMessage("No changes made.");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Save failed:", error);
      setToastMessage("Update failed.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [form, user, updateProfile]);

  if (!isDataLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3D365C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="My Account" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.navigate("/screens/profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* --- PERSONAL INFO (EDITABLE) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          <View style={styles.card}>
            <InputRow
              label="Username"
              value={form.username}
              onChangeText={(t) => setForm({ ...form, username: t })}
            />
            <InputRow
              label="First Name"
              value={form.firstName}
              onChangeText={(t) => setForm({ ...form, firstName: t })}
            />
            <InputRow
              label="Middle Name"
              value={form.middleName}
              onChangeText={(t) => setForm({ ...form, middleName: t })}
            />
            <InputRow
              label="Last Name"
              value={form.lastName}
              onChangeText={(t) => setForm({ ...form, lastName: t })}
              isLast={true}
            />
          </View>
        </View>

        {/* --- LOGIN & SECURITY --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOGIN & SECURITY</Text>
          <View style={styles.card}>
            <InputRow
              label="Email"
              value={form.email}
              onChangeText={() => {}}
              editable={false}
            />

            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.inputLabel}>Change Password</Text>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- PREFERENCES --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            <View style={[styles.linkRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.inputLabel}>Push Notifications</Text>
              <Switch
                value={true}
                trackColor={{ false: "#767577", true: "#3D365C" }}
              />
            </View>
          </View>
        </View>

        {/* --- SAVE BUTTON --- */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onDismiss={() => setShowToast(false)}
        type={toastType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  center: { justifyContent: "center", alignItems: "center" },
  headerContainer: { position: "relative" },
  backButton: { position: "absolute", left: 20, bottom: 15, zIndex: 10 },
  scroll: { padding: 20, paddingBottom: 50 },

  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 13,
    color: "#6D6D72",
    marginBottom: 8,
    marginLeft: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingLeft: 16,
    overflow: "hidden",
  },

  // Row Styles
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    height: 50,
  },
  inputBorder: { borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  inputLabel: { fontSize: 16, color: "#000" },
  inputValue: { fontSize: 16, color: "#007AFF", flex: 1, marginLeft: 10 }, // Blue text for editable fields looks standard on settings
  inputTextDisabled: { color: "#8E8E93" },

  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    height: 50,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },

  saveButton: {
    backgroundColor: "#3D365C",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
