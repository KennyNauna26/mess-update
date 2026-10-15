import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json holds the static config. This file only injects the Google Maps key,
// which must come from the environment so it is never committed to Git.
// Expo Go ignores it; the compiled APK needs it or the map renders blank.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Mess Update',
  slug: config.slug ?? 'mess-update',
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
      },
    },
  },
});
