// Service for working with categories from Supabase
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { handleSupabaseError } from '../utils/handleSupabaseError'

export type Category = Database['public']['Tables']['categories']['Row']
export type CategorialQuestions = Database['public']['Tables']['categorial_questions']['Row']

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) return handleSupabaseError('getCategories', error)
  return data ?? []
}

export async function getCategorialQuestions(categoryId: number = 0): Promise<CategorialQuestions[]> {
  if (categoryId === 0) return []

  const { data, error } = await supabase
    .from('categorial_questions')
    .select(`
      id,
      question,
      question_type,
      description,
      question_answers ( value )
    `)
    .eq('is_active', true)
    .eq('category_id', categoryId);

  if (error) return handleSupabaseError('getCategorialQuestions', error)
  return data ?? []
}
