// lib/auth.tsx (Fixed)
import { Href, useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { api, REFRESH_TOKEN_KEY, TOKEN_KEY } from './api';
import { storage } from './storage';

export interface User {
  // ... (User interface remains the same)
  username: string;
  id: string;
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  role_id?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  initialized: boolean;
  login: (email: string, pass: string) => Promise<void>;
  // 👇 FIX 1: Update signup signature to include first and last name
  signup: (email: string, pass: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ... (state variables and useEffects remain the same)
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await storage.getItem(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          await fetchUserProfile();
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setInitialized(true);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (token && inAuthGroup) {
      router.replace('/(app)' as Href);
    } else if (!token && !inAuthGroup) {
      router.replace('/(auth)/login' as Href);
    }
  }, [token, initialized, segments]);

  const fetchUserProfile = async () => {
    try {
      // FIX: Changed from '/profiles/' to '/profiles/me' based on your backend
      const { data } = await api.get('/profiles/me');

      // Transform response to match User interface
      // Backend returns { role, data: { profile, ... } }
      const profileData = data.data?.profile || data;

      setUser({
        // 👇 FIX: Add 'username' property here
        username: profileData.username || profileData.email,
        id: profileData.id || profileData.uid,
        email: profileData.email,
        first_name: profileData.first_name,
        middle_name: profileData.middle_name,
        last_name: profileData.last_name,
        role_id: profileData.role_id,
      });
    } catch (e: any) {
      console.error('Failed to fetch user profile:', e.response?.data || e.message);
      await logout();
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password: pass
      });

      await storage.setItem(TOKEN_KEY, data.token);
      await storage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

      setToken(data.token);
      await fetchUserProfile();

      router.replace('/(app)' as Href);
    } catch (e: any) {
      console.error('Login failed:', e.response?.data || e.message);

      // ❌ REMOVE THIS ALERT so the Login Screen handles the UI exclusively
      // Alert.alert('Login Failed', errorMessage); 

      // ✅ KEEP THIS! It sends the error to login.tsx
      throw e;
    }
  };

  // 👇 FIX 2: Update signup implementation to accept and use first and last name
  const signup = async (email: string, pass: string, firstName: string, lastName: string) => {
    try {
      await api.post('/auth/signup', {
        email,
        password: pass,
        first_name: firstName, // Sent to backend
        last_name: lastName,   // Sent to backend
      });

      Alert.alert('Success', 'Account created! Logging you in...');
      await login(email, pass);
    } catch (e: any) {
      console.error('Signup failed:', e.response?.data || e.message);

      // The backend returns a detail of type Array(3) if fields are missing, 
      // which is why the UI logging "Signup failed: {detail: Array(3)}"
      const errorMessage = e.response?.data?.detail
        ? (Array.isArray(e.response.data.detail)
          ? 'Missing required fields (First Name/Last Name).'
          : e.response.data.detail)
        : 'Signup failed. Please try again.';

      Alert.alert('Signup Failed', errorMessage);
      throw e;
    }
  };
  // ... (rest of the file is unchanged)
  const updateProfile = async (updates: Partial<User>) => {
    try {
      // FIX: Changed from '/profiles/' to '/profiles/me'
      const { data } = await api.put('/profiles/me', updates);

      // Update local user state
      setUser((prev) => prev ? { ...prev, ...updates } : null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e: any) {
      console.error('Update failed:', e.response?.data || e.message);
      Alert.alert('Update Failed', e.response?.data?.detail || 'Could not update profile');
      throw e;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e: any) {
      console.error('Logout API call failed:', e.response?.data || e.message);
    } finally {
      await storage.deleteItem(TOKEN_KEY);
      await storage.deleteItem(REFRESH_TOKEN_KEY);
      setToken(null);
      setUser(null);
      router.replace('/(auth)/login' as Href);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        initialized,
        login,
        signup,
        logout,
        setUser,
        updateProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}