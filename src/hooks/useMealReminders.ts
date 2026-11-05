import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTodayMeals } from '@/hooks/useMeals';
import {
  DEFAULT_SERVING_START,
  MEAL_TYPES,
  getReminderPermission,
  loadReminderPrefs,
  requestReminderPermission,
  saveReminderPrefs,
  scheduleMealReminders,
  type ReminderPermission,
  type ReminderPrefs,
} from '@/services/reminders';
import type { MealType } from '@/types/models';

/** Loads the saved reminder choices, keeps the schedule in sync with today's serving times. */
export function useMealReminders() {
  const meals = useTodayMeals();
  const [prefs, setPrefs] = useState<ReminderPrefs | null>(null);
  const [permission, setPermission] = useState<ReminderPermission>('undetermined');
  const [savingType, setSavingType] = useState<MealType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usingDefaultTimes = !meals.data || meals.data.length === 0;

  const servingStart = useMemo(() => {
    const times = { ...DEFAULT_SERVING_START };
    for (const meal of meals.data ?? []) {
      times[meal.meal_type] = meal.serving_start;
    }
    return times;
  }, [meals.data]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([loadReminderPrefs(), getReminderPermission()])
      .then(([savedPrefs, currentPermission]) => {
        if (!isMounted) return;
        setPrefs(savedPrefs);
        setPermission(currentPermission);
      })
      .catch(() => {
        if (isMounted) setError('Could not load your reminder settings.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // When today's serving times arrive, move existing reminders to match them.
  useEffect(() => {
    if (!prefs || permission !== 'granted') return;
    if (!MEAL_TYPES.some((type) => prefs[type])) return;
    scheduleMealReminders(prefs, servingStart).catch(() => undefined);
  }, [prefs, permission, servingStart]);

  const toggle = useCallback(
    async (type: MealType, enabled: boolean) => {
      if (!prefs) return;
      setError(null);
      setSavingType(type);
      try {
        if (enabled && permission !== 'granted') {
          const result = await requestReminderPermission();
          setPermission(result);
          if (result !== 'granted') return;
        }
        const next = { ...prefs, [type]: enabled };
        await scheduleMealReminders(next, servingStart);
        await saveReminderPrefs(next);
        setPrefs(next);
      } catch {
        setError('We could not schedule that reminder. Please try again.');
      } finally {
        setSavingType(null);
      }
    },
    [prefs, permission, servingStart],
  );

  return {
    prefs,
    permission,
    servingStart,
    usingDefaultTimes,
    savingType,
    error,
    isLoading: prefs === null && error === null,
    toggle,
  };
}
