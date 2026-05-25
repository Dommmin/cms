import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

async function getWebItem(key: string): Promise<string | null> {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(key);
}

async function setWebItem(key: string, value: string): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, value);
}

async function deleteWebItem(key: string): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(key);
}

export async function getStoredItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return getWebItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setStoredItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') return setWebItem(key, value);
  return SecureStore.setItemAsync(key, value);
}

export async function deleteStoredItem(key: string): Promise<void> {
  if (Platform.OS === 'web') return deleteWebItem(key);
  return SecureStore.deleteItemAsync(key);
}
