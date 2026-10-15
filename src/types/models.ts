// Row shapes for the Supabase tables in supabase/schema.sql.

export type Role = 'student' | 'admin';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type MealStatus = 'upcoming' | 'serving' | 'finished' | 'unavailable';
export type QueueLevel = 'quiet' | 'moderate' | 'busy';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface MessLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Meal {
  id: string;
  meal_date: string; // YYYY-MM-DD
  meal_type: MealType;
  main_dish: string;
  side_dish: string | null;
  drink: string | null;
  description: string | null;
  status: MealStatus;
  serving_start: string; // HH:MM:SS
  serving_end: string;
  created_at: string;
  updated_at: string;
}

export interface QueueReport {
  id: string;
  location_id: string;
  status: QueueLevel;
  wait_min: number;
  wait_max: number;
  note: string | null;
  reported_at: string;
  updated_by: string | null;
  created_at: string;
  mess_locations: Pick<MessLocation, 'name'> | null;
}

export interface Feedback {
  id: string;
  user_id: string;
  meal_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackWithMeal extends Feedback {
  meals: Pick<Meal, 'meal_type' | 'meal_date' | 'main_dish'> | null;
}

export interface FeedbackInput {
  rating: number;
  comment: string;
}
