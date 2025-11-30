import { Href, useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { api, REFRESH_TOKEN_KEY, TOKEN_KEY } from './api';
import { storage } from './storage';

export interface User {
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
  login: (email: string, pass: string, redirectTo?: string) => Promise<void>;
  signup: (email: string, pass: string, firstName: string, lastName: string, username: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  // Load token on mount
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

  // Handle redirects
  useEffect(() => {
    if (!initialized) return;

    // Only redirect explicitly; no default "/"
    if (token && redirectPath) {
      router.replace(redirectPath as Href);
      setRedirectPath(null);
    } else if (!token && segments[0] !== '(auth)') {
      router.replace('/(auth)/login' as Href);
    }

    setReady(true);
  }, [token, initialized, segments, redirectPath]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/profiles/me');
      const profileData = data.data?.profile || data;

      setUser({
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

  const login = async (email: string, pass: string, redirectTo?: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password: pass });
      await storage.setItem(TOKEN_KEY, data.token);
      await storage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

      setToken(data.token);
      await fetchUserProfile();

      if (redirectTo) setRedirectPath(redirectTo);
    } catch (e: any) {
      console.error('Login failed:', e.response?.data || e.message);
      throw e;
    }
  };

  const signup = async (email: string, pass: string, firstName: string, lastName: string, username: string) => {
    try {
      await api.post('/auth/signup', { email, password: pass, first_name: firstName, last_name: lastName, username });
      await login(email, pass, '/onboarding/step1'); // Directly go to onboarding
    } catch (e: any) {
      console.error('Signup failed:', e.response?.data || e.message);

      const errorMessage = e.response?.data?.detail
        ? Array.isArray(e.response.data.detail)
          ? 'Missing required fields.'
          : e.response.data.detail
        : 'Signup failed. Please try again.';

      Alert.alert('Signup Failed', errorMessage);
      throw e;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const { data } = await api.put('/profiles/me', updates);
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
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

  // Block rendering until ready, preventing any "/" flash
  if (!ready) return null;

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
