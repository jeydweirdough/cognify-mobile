import { Href, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/auth';

// --- IMPORT THE NEW SCREEN ---
import LoadingScreen from '../components/loading-screen';
// -----------------------------

import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { token, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (!initialized || (!fontsLoaded && !fontError)) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    if (token && inAuthGroup) {
      router.replace('/(app)' as Href);
    } else if (!token && !inAuthGroup) {
      router.replace('/(auth)/login' as Href);
    }
  }, [token, initialized, fontsLoaded, fontError, segments, router]);

  // --- THIS IS WHERE WE SHOW IT FIRST ---
  // If fonts aren't loaded OR auth isn't ready, return LoadingScreen
  if (!initialized || (!fontsLoaded && !fontError)) {
    return <LoadingScreen />;
  }
  // --------------------------------------

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