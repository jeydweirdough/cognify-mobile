import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Colors, Fonts } from "../../constants/cognify-theme";

// Helper for clean, bold icons
const TabIcon = ({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused?: boolean;
}) => {
  return (
    <Ionicons
      size={28}
      name={name}
      color={color}
      // Opacity for a subtle inactive look
      style={{ opacity: focused ? 1 : 0.8 }}
    />
  );
};

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        // 1. COLORS
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#000000", // Pure black for "Bolder" inactive look

        // 2. LABELS & FONTS
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: Fonts.lexendDecaRegular,
          // REDUCED FONT SIZE to make "Notifications" fit
          fontSize: 11,
          fontWeight: "bold", // Bolder text
          // Reduced margin to tighten the icon/text gap
          marginTop: 2,
        },

        headerShown: false,

        // 3. CONTAINER STYLING (Tighter, Fixed heights)
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,

          // Adjusted heights for a more compact fit with the smaller font
          height: Platform.OS === "ios" ? 95 : 75, // iOS needs 95 for home indicator space, Android 75 for a better fit

          // Adjusted padding for vertical centering
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 25 : 14,

          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" color={color} focused={focused} />
          ),
        }}
      />

      {/* 2. Materials Tab (Learning) */}
      <Tabs.Screen
        name="screens/subjects/index"
        options={{
          title: "Learning",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book-outline" color={color} focused={focused} />
          ),
        }}
      />

      {/* 3. Progress Tab (Bookmark) */}
      <Tabs.Screen
        name="screens/progress/index"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bookmark-outline" color={color} focused={focused} />
          ),
        }}
      />

      {/* 4. Notifications Tab (Bell) */}
      <Tabs.Screen
        name="screens/notifications/index"
        options={{
          title: "Notifications", // This text should now fit
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="notifications-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      {/* 5. Account Tab (Person) */}
      <Tabs.Screen
        name="screens/profile/index"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />

      {/* --- HIDDEN SCREENS --- */}
      <Tabs.Screen
        name="subject/[id]"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="module/[id]"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="profile/[id]"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="progress/[id]"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="quiz/[id]"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen name="flashcards" options={{ href: null }} />
      <Tabs.Screen
        name="assessments"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen
        name="profile/my-account"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="profile/offline-materials"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="profile/progress-overview"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="profile/help-support"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
    </Tabs>
  );
}
