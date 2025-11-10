import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons'; // Using FontAwesome
import { Colors } from '../../constants/cognify-theme'; // Use new theme

// Re-using the IconSymbol component name, but just using FontAwesome for simplicity
const Icon = ({ name, color }: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) => {
  return <FontAwesome size={28} name={name} color={color} />;
};

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.placeholder,
        tabBarShowLabel: false, // Hides text as per the design
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Icon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="user" color={color} />,
        }}
      />
      {/* Added a 4th tab to match the design, you can link it to 'modal' or a new screen */}
      <Tabs.Screen
        name="modal"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Icon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}