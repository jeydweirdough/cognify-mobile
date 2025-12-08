import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // 'slide_from_right' is the standard push animation for Android & Web
        animation: "slide_from_right",
        // Adding a duration forces Web to take time for the transition
        animationDuration: 400,
        // Ensures the background is white during the slide
        contentStyle: { backgroundColor: "#FFFFFF" },
        // Disabling gestures prevents accidental swipes during the wizard flow
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="step1" />
      <Stack.Screen name="step2" />
      <Stack.Screen name="step3" />
      <Stack.Screen name="step4" />
    </Stack>
  );
}
