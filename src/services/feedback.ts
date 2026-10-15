import { supabase } from '@/lib/supabase';
import type { Feedback, FeedbackInput, FeedbackWithMeal } from '@/types/models';

// No user_id filters here on purpose: Row Level Security only ever returns the
// signed-in student's rows, and user_id defaults to auth.uid() on insert.

const WITH_MEAL = '*, meals(meal_type, meal_date, main_dish)';

export async function listMyFeedback(): Promise<FeedbackWithMeal[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select(WITH_MEAL)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FeedbackWithMeal[];
}

export async function getFeedback(id: string): Promise<FeedbackWithMeal | null> {
  const { data, error } = await supabase.from('feedback').select(WITH_MEAL).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as FeedbackWithMeal | null;
}

export async function getMyFeedbackForMeal(mealId: string): Promise<Feedback | null> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('meal_id', mealId)
    .maybeSingle();
  if (error) throw error;
  return data as Feedback | null;
}

export async function createFeedback(mealId: string, input: FeedbackInput): Promise<Feedback> {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ meal_id: mealId, rating: input.rating, comment: input.comment })
    .select('*')
    .single();
  if (error) throw error;
  return data as Feedback;
}

export async function updateFeedback(id: string, input: FeedbackInput): Promise<Feedback> {
  const { data, error } = await supabase
    .from('feedback')
    .update({ rating: input.rating, comment: input.comment })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Feedback;
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) throw error;
}
