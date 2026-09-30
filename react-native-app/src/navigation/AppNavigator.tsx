import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { AudioPodcastScreen } from '../screens/AudioPodcastScreen';
import { Flame, Headphones, Bookmark } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#020617',
          borderTopColor: '#0f172a',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 62,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#f43f5e',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Headlines',
          tabBarIcon: ({ color, size }) => <Flame size={size || 20} color={color} />,
        }}
      />
      <Tab.Screen
        name="PodcastTab"
        component={AudioPodcastScreen}
        options={{
          tabBarLabel: 'Daily Audio',
          tabBarIcon: ({ color, size }) => <Headphones size={size || 20} color={color} />,
        }}
      />
      <Tab.Screen
        name="BookmarksTab"
        component={BookmarksScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => <Bookmark size={size || 20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#020617' },
        animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen 
        name="ArticleDetail" 
        component={ArticleDetailScreen}
        options={{
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}
