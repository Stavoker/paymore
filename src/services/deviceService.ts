// Service for working with categories from Supabase
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { handleSupabaseError } from '../utils/handleSupabaseError'

export type Device = Database['public']['Tables']['devices']['Row']
export const getDevicesByCategory = async (name: string, categoryId: number = 0): Promise<Device[]> => {
  let query = supabase
    .from('devices')
    .select('*')
    .eq('is_active', true);

  if (categoryId > 0) {
    query = query.eq('category_id', categoryId);
  }

  if (name) {
    query = query.ilike('label', `%${name}%`);
  }
  const { data, error } = await query;

  if (error) return handleSupabaseError('getDevices', error)
  return data ?? []
};