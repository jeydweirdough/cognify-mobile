import { AuthProvider, useAuth } from '../lib/auth';
import { Href, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

// --- NEW IMPORTS ---
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
// --- END NEW IMPORTS ---

// Keep the app splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { token, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // --- NEW FONT LOADING LOGIC ---
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  // --- END NEW FONT LOADING LOGIC ---

  useEffect(() => {
    if (!initialized || (!fontsLoaded && !fontError)) return;

    // Hide splash screen once fonts are loaded and auth is initialized
    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    if (token && inAuthGroup) {
      router.replace('/(app)' as Href);
    } else if (!token && !inAuthGroup) {
      router.replace('/(auth)/login' as Href);
    }
  }, [token, initialized, fontsLoaded, fontError, segments, router]);

  // Show loading spinner while auth/fonts are loading
  if (!initialized || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}