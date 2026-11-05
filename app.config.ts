import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json holds the static config. This file only injects the Google Maps key,
// which must come from the environment so it is never committed to Git.
// Expo Go ignores it. In a compiled APK, Google Maps crashes the app if no key is
// declared at all, so a placeholder is used until a real key is configured; the map
// then renders blank instead of crashing, and the rest of the Map screen still works.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Mess Update',
  slug: config.slug ?? 'mess-update',
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY || 'MISSING_GOOGLE_MAPS_KEY',
      },
    },
  },
});
