import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '../config/supabase'

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      price_list: {
        Row: {
          id: number
          device_key: string
          device_name: string
          brand: string
          model: string
          storage: string
          gtin: string | null
          mpn: string | null
          sale_price: number
          buy_min: number | null
          resale_floor: number | null
          category_id: number | null
          subcategory_id: number | null
          icon: string | null
          device_image: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          device_key: string
          device_name: string
          brand: string
          model: string
          storage: string
          gtin?: string | null
          mpn?: string | null
          sale_price: number
          buy_min?: number | null
          resale_floor?: number | null
          category_id?: number | null
          subcategory_id?: number | null
          icon?: string | null
          device_image?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          device_key?: string
          device_name?: string
          brand?: string
          model?: string
          storage?: string
          gtin?: string | null
          mpn?: string | null
          sale_price?: number
          buy_min?: number | null
          resale_floor?: number | null
          category_id?: number | null
          subcategory_id?: number | null
          icon?: string | null
          device_image?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      offer_settings: {
        Row: {
          id: number
          setting_key: string
          setting_value: number | null
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          setting_key: string
          setting_value: number | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          setting_key?: string
          setting_value?: number | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      quotes: {
        Row: {
          id: number
          store: string | null
          mode: string | null
          category: string | null
          subcategory: string | null
          device_name: string | null
          brand: string | null
          model: string | null
          model_code: string | null
          condition: string | null
          battery_percentage: number | null
          has_original_box: boolean | null
          has_original_charger: boolean | null
          imei: string | null
          serial_number: string | null
          quote_amount: number | null
          is_eligible: boolean | null
          buy_min_threshold: number | null
          resale_floor_threshold: number | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_email: string | null
          customer_phone: string | null
          is_business_customer: boolean | null
          business_quantity: number | null
          barcode: string | null
          barcode_title: string | null
          rewards_code: string | null
          user_id: string | null
          created_at: string | null
          status: string | null
        }
        Insert: {
          id?: number
          store?: string | null
          mode?: string | null
          category?: string | null
          subcategory?: string | null
          device_name?: string | null
          brand?: string | null
          model?: string | null
          model_code?: string | null
          condition?: string | null
          battery_percentage?: number | null
          has_original_box?: boolean | null
          has_original_charger?: boolean | null
          imei?: string | null
          serial_number?: string | null
          quote_amount?: number | null
          is_eligible?: boolean | null
          buy_min_threshold?: number | null
          resale_floor_threshold?: number | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          is_business_customer?: boolean | null
          business_quantity?: number | null
          barcode?: string | null
          barcode_title?: string | null
          rewards_code?: string | null
          user_id?: string | null
          created_at?: string | null
          status?: string | null
        }
        Update: {
          id?: number
          store?: string | null
          mode?: string | null
          category?: string | null
          subcategory?: string | null
          device_name?: string | null
          brand?: string | null
          model?: string | null
          model_code?: string | null
          condition?: string | null
          battery_percentage?: number | null
          has_original_box?: boolean | null
          has_original_charger?: boolean | null
          imei?: string | null
          serial_number?: string | null
          quote_amount?: number | null
          is_eligible?: boolean | null
          buy_min_threshold?: number | null
          resale_floor_threshold?: number | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          is_business_customer?: boolean | null
          business_quantity?: number | null
          barcode?: string | null
          barcode_title?: string | null
          rewards_code?: string | null
          user_id?: string | null
          created_at?: string | null
          status?: string | null
        }
      }
      categories: {
        Row: {
          id: number
          key: string
          label: string
          icon: string | null
          parent_id: number | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          key: string
          label: string
          icon?: string | null
          parent_id?: number | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          key?: string
          label?: string
          icon?: string | null
          parent_id?: number | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subcategories: {
        Row: {
          id: number
          key: string
          label: string
          category_id: number
          sort_order: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          key: string
          label: string
          category_id: number
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          key?: string
          label?: string
          category_id?: number
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      devices: {
        Row: {
          id: number
          key: string
          label: string
          brand: string
          model: string
          gtin: string | null
          mpn: string | null
          buy_min: number | null
          resale_floor: number | null
          icon: string | null
          category_id: number | null
          subcategory_id: number | null
          device_image: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          key: string
          label: string
          brand: string
          model: string
          gtin?: string | null
          mpn?: string | null
          buy_min?: number | null
          resale_floor?: number | null
          icon?: string | null
          category_id?: number | null
          subcategory_id?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          key?: string
          label?: string
          brand?: string
          model?: string
          gtin?: string | null
          mpn?: string | null
          buy_min?: number | null
          resale_floor?: number | null
          icon?: string | null
          category_id?: number | null
          subcategory_id?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      device_variants: {
        Row: {
          id: number
          device_id: number
          key: string // e.g. "iPhone 14 Pro - 256GB"
          label: string
          ram: string
          storage: string
          color: string
          sku: string
          gtin: string
          mpn: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
      },
      device_characteristics: {
        Row: {
          id: number
          device_id: number
          name: string // e.g. "iPhone 14 Pro - 256GB"
          value: string
          unit: string
          created_at: string
        }
      }

    }
    Views: {
      [key: string]: {
        Row: Record<string, any>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, any>
        Returns: any
      }
    }
    Enums: {
      [key: string]: string
    }
  }
}