import * as Linking from 'expo-linking';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

import { useMealReminders } from '@/hooks/useMealReminders';
import { MEAL_TYPES, REMINDER_LEAD_MINUTES, reminderTime } from '@/services/reminders';
import { colors, spacing, typography } from '@/theme';
import { formatTime, mealTypeLabel } from '@/utils/format';

import { AppButton } from './AppButton';
import { Card } from './Card';
import { FormMessage } from './StateViews';

function clock({ hour, minute }: { hour: number; minute: number }): string {
  return formatTime(`${hour}:${String(minute).padStart(2, '0')}`);
}

/** Profile section: one switch per meal; reminders fire before each meal is served. */
export function MealRemindersCard() {
  const {
    prefs,
    permission,
    servingStart,
    usingDefaultTimes,
    savingType,
    error,
    isLoading,
    toggle,
  } = useMealReminders();

  return (
    <Card>
      <Text style={typography.caption}>
        Get a notification {REMINDER_LEAD_MINUTES} minutes before a meal is served.
      </Text>

      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}

      {permission === 'denied' ? (
        <View style={styles.notice}>
          <FormMessage
            tone="danger"
            message="Notifications are turned off for Mess Update. Allow them in Settings to get meal reminders."
          />
          <AppButton
            title="Open Settings"
            variant="secondary"
            onPress={() => Linking.openSettings()}
          />
        </View>
      ) : null}

      {error ? <FormMessage tone="danger" message={error} /> : null}

      {prefs
        ? MEAL_TYPES.map((type) => (
            <View key={type} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={typography.body}>{mealTypeLabel[type]}</Text>
                <Text style={typography.caption}>
                  Reminder at {clock(reminderTime(servingStart[type]))}
                </Text>
              </View>
              {savingType === type ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Switch
                  accessibilityLabel={`${mealTypeLabel[type]} reminder`}
                  value={prefs[type]}
                  onValueChange={(value) => toggle(type, value)}
                  disabled={savingType !== null || permission === 'denied'}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={colors.white}
                />
              )}
            </View>
          ))
        : null}

      {prefs && usingDefaultTimes ? (
        <Text style={typography.caption}>
          Today’s menu isn’t posted yet, so reminders use the usual serving times.
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  notice: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  rowText: { flex: 1, gap: 2 },
});
