import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useMessLocations, useUserLocation } from '@/hooks/useMessLocation';
import { colors, spacing, typography } from '@/theme';
import type { MessLocation } from '@/types/models';
import { toFriendlyMessage } from '@/utils/errors';
import { distanceMeters, formatDistance, walkingMinutes } from '@/utils/format';

function openDirections(mess: MessLocation) {
  const destination = `${mess.latitude},${mess.longitude}`;
  Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`,
  );
}

export default function MapScreen() {
  const locations = useMessLocations();
  const { state: userLocation, retry } = useUserLocation();

  if (locations.isPending) {
    return <LoadingState message="Loading the map…" />;
  }
  if (locations.isError) {
    return (
      <ErrorState
        message={toFriendlyMessage(locations.error)}
        onRetry={() => locations.refetch()}
        retrying={locations.isRefetching}
      />
    );
  }
  const mainMess = locations.data[0];
  if (!mainMess) {
    return <EmptyState icon="map-outline" title="No mess location saved yet" />;
  }

  const distance =
    userLocation.status === 'success' ? distanceMeters(userLocation.coords, mainMess) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Text style={[typography.title, styles.title]}>Mess location</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: mainMess.latitude,
          longitude: mainMess.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={userLocation.status === 'success'}
        showsMyLocationButton
      >
        {locations.data.map((mess) => (
          <Marker
            key={mess.id}
            coordinate={{ latitude: mess.latitude, longitude: mess.longitude }}
            title={mess.name}
            pinColor={colors.accent}
          />
        ))}
      </MapView>

      <View style={styles.panel}>
        <Card>
          <Text style={typography.heading}>{mainMess.name}</Text>
          {userLocation.status === 'loading' ? (
            <Text style={typography.caption}>Finding your location…</Text>
          ) : null}
          {distance !== null ? (
            <Text style={typography.body}>
              {formatDistance(distance)} · about {walkingMinutes(distance)} min walk
            </Text>
          ) : null}
          {userLocation.status === 'denied' ? (
            <View style={styles.notice}>
              <Ionicons name="location-outline" size={18} color={colors.warning} />
              <Text style={[typography.caption, styles.noticeText]}>
                Location is off, so we can't show how far you are. You can still see the mess on the map.
              </Text>
            </View>
          ) : null}
          {userLocation.status === 'error' ? (
            <Text style={[typography.caption, { color: colors.danger }]}>{userLocation.message}</Text>
          ) : null}

          {userLocation.status === 'denied' ? (
            <AppButton title="Allow location in Settings" variant="secondary" onPress={() => Linking.openSettings()} />
          ) : null}
          {userLocation.status === 'error' ? (
            <AppButton title="Retry location" variant="secondary" onPress={retry} />
          ) : null}
          <AppButton title="Walking directions" onPress={() => openDirections(mainMess)} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  title: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  map: { flex: 1 },
  panel: { padding: spacing.lg },
  notice: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  noticeText: { flex: 1, color: colors.warning },
});
