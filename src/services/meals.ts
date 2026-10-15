import { supabase } from '@/lib/supabase';
import type { Meal } from '@/types/models';

export async function getMealsForDate(date: string): Promise<Meal[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('meal_date', date)
    .order('serving_start', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Meal[];
}

export async function getMeal(id: string): Promise<Meal | null> {
  const { data, error } = await supabase.from('meals').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Meal | null;
}
