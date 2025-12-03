// src/services/quoteService.ts
import { supabase } from '../lib/supabase';

export interface noVariant {
  device_name?: string | null;
  user_email: string;
  user_name?: string | null;
  consignment_type?: string | null;
  image_1?: string | null;
  image_2?: string | null;
  image_3?: string | null;
}

export async function createNoVariantRequest(payload: noVariant) {
  // If JSON not provided, default to empty object
  const finalPayload = {
    ...payload
  };

  const { data, error } = await supabase
    .from("novariant")
    .insert(finalPayload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting quote:", error);
    throw error;
  }

  return data;
}
