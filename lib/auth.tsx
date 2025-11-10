import React, { createContext, useContext, useState, useEffect } from 'react';
// --- FIX: Import our custom storage wrapper ---
import { storage } from './storage';
import { Href, useRouter, useSegments } from 'expo-router'; 
import { api, TOKEN_KEY } from './api';

// Define the shape of the user profile based on backend's UserProfileModel
interface User {
  id: string;
  email: string;
  first_name?: string;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Load token from storage on app startup
    const loadToken = async () => {
      try {
        // --- FIX: Use our storage wrapper ---
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
    // Handle redirection based on auth state
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
      // Backend route: GET /profiles/
      const { data } = await api.get('/profiles/');
      setUser(data);
    } catch (e: any) {
      console.error('Failed to fetch user profile:', e.response?.data || e.message);
      await logout();
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      // Backend route: POST /auth/login
      const { data } = await api.post('/auth/login', { email, password: pass });
      
      // --- FIX: Use our storage wrapper ---
      await storage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      
      await fetchUserProfile();
      router.replace('/(app)' as Href);
    } catch (e: any) {
      console.error('Login failed:', e.response?.data || e.message);
      alert(`Login Failed: ${e.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const signup = async (email: string, pass: string) => {
    try {
      // Backend route: POST /auth/signup
      await api.post('/auth/signup', { email, password: pass });
      await login(email, pass);
    } catch (e: any) {
      console.error('Signup failed:', e.response?.data || e.message);
      alert(`Signup Failed: ${e.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const logout = async () => {
    try {
      // Backend route: POST /auth/logout
      await api.post('/auth/logout');
    } catch (e: any) {
      console.error('Logout API call failed:', e.response?.data || e.message);
    } finally {
      // --- FIX: Use our storage wrapper ---
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
      }}>
      {children}
    </AuthContext.Provider>
  );
}