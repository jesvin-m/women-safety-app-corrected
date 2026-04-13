import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Must match default `PORT` in `server/.env` for local dev. */
export const DEV_SERVER_PORT = 5000;

/**
 * Base URL for HTTP + Socket.IO (no trailing slash).
 * Set `EXPO_PUBLIC_SERVER_URL` in `.env` for real devices / ngrok / cloud.
 */
export function getServerBaseUrl() {
  const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  const fromExtra = extra.EXPO_PUBLIC_SERVER_URL;
  const fromEnv =
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SERVER_URL
      ? process.env.EXPO_PUBLIC_SERVER_URL
      : '';
  const raw = String(fromExtra || fromEnv || '').trim();
  if (raw) return raw.replace(/\/$/, '');

  if (__DEV__) {
    return Platform.OS === 'android'
      ? `http://10.0.2.2:${DEV_SERVER_PORT}`
      : `http://localhost:${DEV_SERVER_PORT}`;
  }

  return '';
}
