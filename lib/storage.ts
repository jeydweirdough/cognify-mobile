import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// This is a cross-platform storage solution.
// It uses SecureStore on native (iOS/Android) and localStorage on web.
// This will fix the "is not a function" error on web.

export const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Failed to get from localStorage', e);
        return null;
      }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Failed to remove from localStorage', e);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};