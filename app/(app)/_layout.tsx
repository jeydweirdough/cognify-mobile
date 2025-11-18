import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/cognify-theme';
import { Platform } from 'react-native';

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
        tabBarInactiveTintColor: '#3e4042ff',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 24 : 16,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 95,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          marginHorizontal: 1,
        },
      }}>
      
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" color={color} />,
        }}
      />
      
      {/* 2. Learning Tab */}
      <Tabs.Screen
        name="screens/subjects/index"
        options={{
          title: 'Learning',
          tabBarIcon: ({ color }) => <Icon name="book" color={color} />,
        }}
      />

      {/* 3. Progress Tab */}
      <Tabs.Screen
        name="screens/progress/index"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <Icon name="flag" color={color} />,
        }}
      />
      
      {/* 4. Notifications Tab */}
      <Tabs.Screen
        name="screens/notifications/index"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Icon name="bell" color={color} />,
        }}
      />
      
      {/* 5. Account Tab */}
      <Tabs.Screen
        name="screens/profile/index"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Icon name="user" color={color} />,
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="subject/[id]"
        options={{
          href: null,
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
          href: null,
        }}
      />
    </Tabs>
  );
}