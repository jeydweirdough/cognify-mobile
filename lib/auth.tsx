import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from './storage';
import { Href, useRouter, useSegments } from 'expo-router'; 
import { api, TOKEN_KEY } from './api';
import { Alert } from 'react-native'; 

export interface User {
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
  signup: (email: string, pass: string) => Promise<void>;
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
  }, [token, initialized, segments, router]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/profiles/');
      setUser(data);
    } catch (e: any) {
      console.error('Failed to fetch user profile:', e.response?.data || e.message);
      await logout();
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password: pass });
      await storage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      await fetchUserProfile();
      router.replace('/(app)' as Href);
    } catch (e: any) {
      console.error('Login failed:', e.response?.data || e.message);
      Alert.alert(`Login Failed`, e.response?.data?.detail || 'Unknown error');
      throw e; 
    }
  };

  const signup = async (email: string, pass: string) => {
    try {
      await api.post('/auth/signup', { email, password: pass });
      Alert.alert('Account Created', 'Your account has been successfully created. Logging you in...');
      await login(email, pass);
    } catch (e: any) {
      console.error('Signup failed:', e.response?.data || e.message);
      if (e.response?.data?.detail.includes('Account with email')) {
        Alert.alert(`Signup Failed`, e.response?.data?.detail || 'Unknown error');
      }
      throw e; 
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      // FIXED: Switched from PATCH to PUT to resolve 405 Method Not Allowed error.
      const { data } = await api.put('/profiles/', updates);
      
      setUser(data);
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