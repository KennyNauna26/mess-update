import type { StatusTone } from '@/theme';
import type { MealStatus, MealType, QueueLevel } from '@/types/models';

/** Today's date in the phone's local time zone as YYYY-MM-DD (matches meals.meal_date). */
export function localDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Midnight today in local time, as an ISO timestamp for timestamptz filters. */
export function startOfTodayISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

/** "13:30:00" → "1:30 PM" */
export function formatTime(time: string): string {
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteText} ${suffix}`;
}

export function formatClock(iso: string): string {
  const date = new Date(iso);
  return formatTime(`${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate.length === 10 ? `${isoDate}T00:00:00` : isoDate);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function minutesSince(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60000));
}

export function timeAgo(iso: string): string {
  const minutes = minutesSince(iso);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return formatDate(iso);
}

export const mealTypeLabel: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export const mealStatusLabel: Record<MealStatus, { label: string; tone: StatusTone }> = {
  serving: { label: 'Serving now', tone: 'success' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
  finished: { label: 'Finished', tone: 'neutral' },
  unavailable: { label: 'Unavailable', tone: 'danger' },
};

export const queueLevelLabel: Record<QueueLevel, { label: string; tone: StatusTone }> = {
  quiet: { label: 'Quiet', tone: 'success' },
  moderate: { label: 'Moderate', tone: 'warning' },
  busy: { label: 'Busy', tone: 'danger' },
};

export function waitLabel(min: number, max: number): string {
  if (max === 0) return 'No wait';
  if (min === max) return `${min} minutes`;
  return `${min}–${max} minutes`;
}

/** Queue reports older than this are flagged as possibly outdated. */
export const QUEUE_STALE_MINUTES = 60;

/** Straight-line distance in metres between two coordinates (Haversine formula). */
export function distanceMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const earthRadius = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

/** About 80 m per minute at a normal walking pace. */
export function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 80));
}
