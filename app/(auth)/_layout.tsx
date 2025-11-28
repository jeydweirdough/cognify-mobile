import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      {/* 
         Matches 'login.tsx'. 
         'headerShown: false' hides the default top bar 
      */}
      <Stack.Screen name="login" options={{ headerShown: false }} />

      {/* 
         Matches 'signup.tsx'. 
         Ensure your file is named 'signup.tsx' (not 'sign-up.tsx') 
      */}
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}