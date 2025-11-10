// Service for working with categories from Supabase
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { handleSupabaseError } from '../utils/handleSupabaseError'
import { DeviceVariant } from '../types/category';

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

export const getDeviceVariants = async (deviceId: number = 0): Promise<DeviceVariant[]> => {
  let query = supabase
    .from('device_variants')
    .select('*')
    .eq('is_active', true);

  if (deviceId > 0) {
    query = query.eq('device_id', deviceId);
  }

  const { data, error } = await query;

  if (error) return handleSupabaseError('getDeviceVariants', error)
  return data ?? []
};

export const getDeviceVariantById = async (deviceVariantId: number = 0): Promise<DeviceVariant | null> => {
  if (deviceVariantId === 0) return null;

  const { data, error } = await supabase
    .from('device_variants')
    .select('*')
    .eq('is_active', true)
    .eq('id', deviceVariantId)
    .single<DeviceVariant>();

  if (error) return null
  return data ?? null
};