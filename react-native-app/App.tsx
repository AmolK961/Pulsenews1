import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { updateService } from './src/services/updateService';

/**
 * PulseNews Mobile - Cross-Platform React Native App
 * Fully optimized for Apple iOS (iPhone/iPad) & Android Devices.
 * Supports Over-The-Air (OTA) Live Updates via Expo Updates.
 */
export default function App() {
  useEffect(() => {
    // Check for new updates immediately on app launch
    // If a new update was published with EAS Update, it downloads
    // in the background and reloads the app bundle instantly.
    updateService.checkForUpdatesOnLaunch();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#020617" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
