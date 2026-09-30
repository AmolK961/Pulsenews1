import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

/**
 * PulseNews Over-The-Air (OTA) & Live Code Update Manager
 * 
 * Ensures that changes published via EAS Update take effect immediately
 * on both Apple iOS and Android devices without requiring a full App Store
 * or Google Play review cycle.
 */
class UpdateService {
  /**
   * Automatically check for updates on app launch and reload if available.
   */
  async checkForUpdatesOnLaunch(): Promise<boolean> {
    // Updates are typically disabled in local dev / Expo Go
    if (__DEV__) {
      console.log('[UpdateService] Running in Development Mode. Code changes apply via Fast Refresh.');
      return false;
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        console.log('[UpdateService] New code update detected! Fetching update bundle...');
        await Updates.fetchUpdateAsync();
        
        // Apply the change immediately by reloading the app bundle
        Alert.alert(
          '✨ Update Ready',
          'A new version with the latest improvements has been downloaded. Restart to apply immediately?',
          [
            { text: 'Later', style: 'cancel' },
            { 
              text: 'Restart & Apply', 
              onPress: async () => {
                await Updates.reloadAsync();
              } 
            }
          ]
        );
        return true;
      }
    } catch (error) {
      console.warn('[UpdateService] Update check failed:', error);
    }
    return false;
  }

  /**
   * Manual check triggered by user in Settings or Header.
   */
  async checkManually(): Promise<{ success: boolean; message: string }> {
    if (__DEV__) {
      return { 
        success: true, 
        message: 'Dev mode: Hot reload is active. Run "eas update" in production to push OTA updates.' 
      };
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        return { success: true, message: 'Update downloaded and applied!' };
      } else {
        return { success: true, message: 'You already have the latest version.' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Could not reach update server.' };
    }
  }

  /**
   * Get current release channel and update ID
   */
  getUpdateInfo() {
    return {
      channel: Updates.channel || 'development',
      updateId: Updates.updateId || 'embedded',
      runtimeVersion: Updates.runtimeVersion || '1.0.0',
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      platform: Platform.OS,
    };
  }
}

export const updateService = new UpdateService();
