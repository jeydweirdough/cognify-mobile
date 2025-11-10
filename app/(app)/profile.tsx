import { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '../../lib/auth';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import { api } from '../../lib/api';
import type { User } from '../../lib/types';

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuth(); // Get setUser from context
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Local state for form fields
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');

  // Update local state if user context changes
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
      };
      // Call the backend endpoint to update the profile
      const { data } = await api.put<User>(`/profiles/${user.id}`, payload);

      // Update the user state in the auth context
      setUser(data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset fields to original values
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account information
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            {isLoading && <ActivityIndicator size="large" color={Colors.primary} />}

            {!isEditing ? (
              // --- DISPLAY MODE ---
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.info}>{user?.email}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>First Name:</Text>
                  <Text style={styles.info}>
                    {user?.first_name || 'Not set'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Last Name:</Text>
                  <Text style={styles.info}>
                    {user?.last_name || 'Not set'}
                  </Text>
                </View>

                <Pressable
                  style={styles.primaryButton}
                  onPress={() => setIsEditing(true)}>
                  <FontAwesome name="edit" size={16} color={Colors.white} />
                  <Text style={styles.primaryButtonText}>Edit Profile</Text>
                </Pressable>
              </>
            ) : (
              // --- EDITING MODE ---
              <>
                <Text style={styles.label}>Email (cannot be changed):</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={user?.email}
                  editable={false}
                  placeholderTextColor={Colors.placeholder}
                />

                <Text style={styles.label}>First Name:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.placeholder}
                />

                <Text style={styles.label}>Last Name:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.placeholder}
                />

                <View style={styles.buttonContainer}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={handleCancel}
                    disabled={isLoading}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={handleSave}
                    disabled={isLoading}>
                    <FontAwesome name="save" size={16} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Save</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          {/* Logout Button */}
          {!isEditing && (
            <Pressable style={styles.logoutButton} onPress={logout}>
              <FontAwesome name="sign-out" size={16} color="#FF5C5C" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 6,
  },
  info: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.text,
  },
  input: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    backgroundColor: Colors.background, // Use light background for input
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 12, // Rounded rect instead of pill
    marginBottom: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    color: Colors.textLight,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 16,
  },
  primaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.textLight,
  },
  secondaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF5C5C',
  },
  logoutButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#FF5C5C',
  },
});