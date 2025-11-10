import { Stack } from 'expo-router';

export default function AuthLayout() {
  // This stack contains the login and signup screens
  // It will be hidden once the user is authenticated
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}