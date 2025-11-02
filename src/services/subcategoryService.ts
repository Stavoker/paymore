// Service for working with categories from Supabase
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { handleSupabaseError } from '../utils/handleSupabaseError'

export type Subcategory = Database['public']['Tables']['subcategories']['Row']

export async function getSubcategories(categoryId?: number): Promise<Subcategory[]> {
  let query = supabase
    .from('subcategories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query;

  if (error) return handleSupabaseError('getCategories', error)
  return data ?? []
}