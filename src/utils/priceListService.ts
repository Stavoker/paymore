// Functions for working with price_list table
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type PriceListItem = Database['public']['Tables']['price_list']['Row'];
type PriceListInsert = Database['public']['Tables']['price_list']['Insert'];
type PriceListUpdate = Database['public']['Tables']['price_list']['Update'];

// Get global offer settings
export const getOfferSettings = async (): Promise<Record<string, number>> => {
  debugger
  try {
    const { data, error } = await supabase
      .from('offer_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('Error fetching offer settings:', error);
      return {};
    }

    // Convert array to object for easy access
    const settings: Record<string, number> = {};
    data.forEach((item: { setting_key: string; setting_value: number | null }) => {
      if (item.setting_value !== null) {
        settings[item.setting_key] = item.setting_value;
      }
    });

    return settings;
  } catch (error) {
    console.error('Error in getOfferSettings:', error);
    return {};
  }
};

// Interface for price search parameters
export interface PriceSearchParams {
  device_name?: string;
  brand?: string;
  storage?: string;
  condition?: 'Excellent' | 'Good' | 'Fair';
  original_box?: boolean;
  original_charger?: boolean;
  unlocked?: boolean;
  battery_percentage?: number; // Add battery percentage for deductions
}

// Interface for search result with calculated price
export interface PriceResult extends PriceListItem {
  calculated_price?: number;
  deductions?: {
    no_box: number;
    no_charger: number;
  };
  final_price?: number;
  flawless_price?: number; // Store the flawless price for reference
}

// Search prices by parameters from unified price_list table
export const searchPrices = async (params: PriceSearchParams): Promise<PriceResult[]> => {
  try {
    let query = supabase.from('price_list').select('*').eq('is_active', true);

    // Add filters
    if (params.device_name) {
      query = query.ilike('device_name', `%${params.device_name}%`);
    }
    if (params.brand) {
      query = query.ilike('brand', `%${params.brand}%`);
    }
    if (params.storage) {
      query = query.ilike('storage', `%${params.storage}%`);
    }
    // Note: condition, original_box, original_charger, unlocked are user inputs, not database filters
    // Filter by is_active to only show active devices
    query = query.eq('is_active', true);

    const { data, error } = await query;

    if (error) {
      console.error('Error searching prices:', error);
      return [];
    }

    // Calculate final price for each result
    const results = await Promise.all(
      data.map((item: PriceListItem) => calculateFinalPrice(item, params))
    );
    return results;
  } catch (error) {
    console.error('Error in searchPrices:', error);
    return [];
  }
};

// Apply battery percentage deductions according to the specification
export const applyBatteryDeduction = (offer: number, batteryPercentage: number): number => {
  let batteryMultiplier = 1.0;
  
  if (batteryPercentage <= 40) {
    batteryMultiplier = 1 - 0.25; // 25% deduction
  } else if (batteryPercentage <= 60) {
    batteryMultiplier = 1 - 0.15; // 15% deduction
  } else if (batteryPercentage <= 80) {
    batteryMultiplier = 1 - 0.05; // 5% deduction
  } else {
    batteryMultiplier = 1.0; // No deduction for 81-100%
  }
  
  return Math.max(0, Math.round(offer * batteryMultiplier));
};

// Calculate final price with deductions according to the offer calculator specification
export const calculateFinalPrice = async (item: PriceListItem, params: PriceSearchParams): Promise<PriceResult> => {
  // Check if device is unlocked - if not, return 0 immediately
  if (params.unlocked === false) {
    return {
      ...item,
      calculated_price: 0,
      deductions: { no_box: 0, no_charger: 0 },
      final_price: 0
    };
  }

  // Get global settings
  const settings = await getOfferSettings();
  const totalMargin = settings.paymore_margin || 0;
  const shipping = settings.shipping_cost || 0;
  const noBoxDeduction = settings.no_box_deduction || 0;
  const noChargerDeduction = settings.no_charger_deduction || 0;

  const salePrice = item.sale_price || 0;
  
  const deductions = {
    no_box: 0,
    no_charger: 0
  };

  // Apply total margin to sale_price: keep (1 - total_margin) of sale_price
  let flawlessPrice = salePrice * (1 - totalMargin);
  
  // Subtract shipping costs
  flawlessPrice -= shipping;
  
  // Deduction for missing box
  if (params.original_box === false) {
    deductions.no_box = noBoxDeduction;
    flawlessPrice -= noBoxDeduction;
  }

  // Deduction for missing charger
  if (params.original_charger === false) {
    deductions.no_charger = noChargerDeduction;
    flawlessPrice -= noChargerDeduction;
  }

  // Clamp and round: never below 0; round to the nearest dollar
  flawlessPrice = Math.max(0, Math.round(flawlessPrice));

  // Calculate condition-based offers (Good and Fair are discounts from Flawless)
  let conditionPrice = flawlessPrice;
  if (params.condition === 'Good') {
    conditionPrice = Math.max(0, Math.round(flawlessPrice * (1 - 0.15))); // 15% off Flawless
  } else if (params.condition === 'Fair') {
    conditionPrice = Math.max(0, Math.round(flawlessPrice * (1 - 0.30))); // 30% off Flawless
  }
  // Excellent/Flawless uses the base price without additional discount

  // Apply battery percentage deductions if provided
  let finalPrice = conditionPrice;
  if (params.battery_percentage !== undefined) {
    finalPrice = applyBatteryDeduction(conditionPrice, params.battery_percentage);
  }

  return {
    ...item,
    calculated_price: salePrice,
    deductions,
    final_price: finalPrice,
    flawless_price: flawlessPrice // Store flawless price for reference
  };
};

// Get all brands
export const getAllBrands = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('price_list')
      .select('brand')
      .eq('is_active', true)
      .order('brand');

    if (error) {
      console.error('Error fetching brands:', error);
      return [];
    }

    // Remove duplicates
    const uniqueBrands = Array.from(new Set(data.map((item: { brand: string }) => item.brand)));
    return uniqueBrands;
  } catch (error) {
    console.error('Error in getAllBrands:', error);
    return [];
  }
};

// Get all devices by brand
export const getDevicesByBrand = async (brand: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('price_list')
      .select('device_name')
      .eq('brand', brand)
      .eq('is_active', true)
      .order('device_name');

    if (error) {
      console.error('Error fetching devices by brand:', error);
      return [];
    }

    // Remove duplicates
    const uniqueDevices = Array.from(new Set(data.map((item: { device_name: string }) => item.device_name)));
    return uniqueDevices;
  } catch (error) {
    console.error('Error in getDevicesByBrand:', error);
    return [];
  }
};

// Get storage options for device
export const getStorageOptions = async (deviceName: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('price_list')
      .select('storage')
      .eq('device_name', deviceName)
      .eq('is_active', true)
      .order('storage');

    if (error) {
      console.error('Error fetching storage options:', error);
      return [];
    }

    // Видаляємо дублікати
    const uniqueStorage = Array.from(new Set(data.map((item: { storage: string }) => item.storage)));
    return uniqueStorage;
  } catch (error) {
    console.error('Error in getStorageOptions:', error);
    return [];
  }
};

// Get price for specific device from unified price_list table
export const getPriceForDevice = async (
  deviceName: string,
  storage: string,
  condition: 'Excellent' | 'Good' | 'Fair',
  originalBox: boolean = true,
  originalCharger: boolean = true,
  unlocked: boolean = true,
  batteryPercentage?: number
): Promise<PriceResult | null> => {
  try {
    console.log('getPriceForDevice called with:', {
      deviceName,
      storage,
      condition,
      originalBox,
      originalCharger,
      unlocked,
      batteryPercentage
    });

    const { data, error } = await supabase
      .from('price_list')
      .select('*')
      .eq('device_name', deviceName)
      .eq('storage', storage)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching price for device:', error);
      console.log('Query parameters:', { deviceName, storage });
      return null;
    }

    console.log('Found device data:', data);

    const result = await calculateFinalPrice(data, {
      condition: condition,
      original_box: originalBox,
      original_charger: originalCharger,
      unlocked: unlocked,
      battery_percentage: batteryPercentage
    });

    console.log('Final calculated result:', result);
    return result;
  } catch (error) {
    console.error('Error in getPriceForDevice:', error);
    return null;
  }
};

// Add new price list item (for administrators)
export const addPriceListItem = async (item: PriceListInsert): Promise<PriceListItem | null> => {
  try {
    const { data, error } = await supabase
      .from('price_list')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error adding price list item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addPriceListItem:', error);
    return null;
  }
};

// Update price list item (for administrators)
export const updatePriceListItem = async (
  id: number,
  updates: PriceListUpdate
): Promise<PriceListItem | null> => {
  try {
    const { data, error } = await supabase
      .from('price_list')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating price list item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePriceListItem:', error);
    return null;
  }
};

// Delete price list item (for administrators)
export const deletePriceListItem = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('price_list')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting price list item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePriceListItem:', error);
    return false;
  }
};

// Search by device name (for autocomplete)
export const searchDevices = async (query: string, limit: number = 10): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('price_list')
      .select('device_name')
      .ilike('device_name', `%${query}%`)
      .limit(limit)
      .order('device_name');

    if (error) {
      console.error('Error searching devices:', error);
      return [];
    }

    // Remove duplicates
    const uniqueDevices = Array.from(new Set(data.map((item: { device_name: string }) => item.device_name)));
    return uniqueDevices;
  } catch (error) {
    console.error('Error in searchDevices:', error);
    return [];
  }
};
