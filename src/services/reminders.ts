import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { MealType } from '@/types/models';

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

/** Reminders fire this many minutes before a meal starts being served. */
export const REMINDER_LEAD_MINUTES = 15;

/** Usual serving times, used when today's menu has not been posted yet. */
export const DEFAULT_SERVING_START: Record<MealType, string> = {
  breakfast: '06:30:00',
  lunch: '11:30:00',
  dinner: '17:30:00',
};

export type ReminderPrefs = Record<MealType, boolean>;
export type ReminderPermission = 'granted' | 'denied' | 'undetermined';

const PREFS_KEY = 'mess-update:reminder-prefs';
const CHANNEL_ID = 'meal-reminders';
const DEFAULT_PREFS: ReminderPrefs = { breakfast: false, lunch: false, dinner: false };

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

/** The student's on/off choice per meal is a preference, so it lives on the device. */
export async function loadReminderPrefs(): Promise<ReminderPrefs> {
  const stored = await AsyncStorage.getItem(PREFS_KEY);
  if (!stored) return DEFAULT_PREFS;
  return { ...DEFAULT_PREFS, ...(JSON.parse(stored) as Partial<ReminderPrefs>) };
}

export async function saveReminderPrefs(prefs: ReminderPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function getReminderPermission(): Promise<ReminderPermission> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
}

export async function requestReminderPermission(): Promise<ReminderPermission> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Meal reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

/** "11:30:00" minus 15 minutes → { hour: 11, minute: 15 } */
export function reminderTime(servingStart: string): { hour: number; minute: number } {
  const [hourText, minuteText] = servingStart.split(':');
  const total = (Number(hourText) * 60 + Number(minuteText) - REMINDER_LEAD_MINUTES + 1440) % 1440;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

/**
 * Replaces every scheduled reminder with one daily reminder per enabled meal.
 * Returns how many reminders are now scheduled.
 */
export async function scheduleMealReminders(
  prefs: ReminderPrefs,
  servingStart: Record<MealType, string>,
): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  let scheduled = 0;
  for (const type of MEAL_TYPES) {
    if (!prefs[type]) continue;
    const { hour, minute } = reminderTime(servingStart[type]);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${MEAL_LABEL[type]} starts in ${REMINDER_LEAD_MINUTES} minutes`,
        body: 'Check the menu and the queue in Mess Update before you go.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });
    scheduled += 1;
  }
  return scheduled;
}
