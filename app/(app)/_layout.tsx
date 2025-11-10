import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/cognify-theme';

const Icon = ({ 
  name, 
  color 
}: { 
  name: React.ComponentProps<typeof FontAwesome>['name']; 
  color: string;
}) => {
  return <FontAwesome size={24} name={name} color={color} />;
};

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.placeholder,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
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
        name="subjects"
        options={{
          title: 'Subjects',
          tabBarIcon: ({ color }) => <Icon name="book" color={color} />,
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <Icon name="bar-chart" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="user" color={color} />,
        }}
      />

      {/* Hidden screens (not in tab bar) */}
      <Tabs.Screen
        name="subject/[id]"
        options={{
          href: null, // Hides from tab bar
        }}
      />
      
      <Tabs.Screen
        name="module/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="quiz"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="flashcards"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="assessments"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide old explore
        }}
      />
    </Tabs>
  );
}