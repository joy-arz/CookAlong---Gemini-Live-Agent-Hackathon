// Use EXPO_PUBLIC_* env vars for API/WS URLs (set in .env.development or .env.production)
// frontend/config.js
import Constants from 'expo-constants';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.cookalong.app';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.cookalong.app/ws';
