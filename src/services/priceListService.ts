// Service for working with categories from Supabase
import { supabase } from '../lib/supabase';
import { getCategoryById } from './categoryService';
import { getDeviceVariantById } from './deviceService';

export async function getDeviceVariantPrice(categoryId: number = 0, deviceVariantId: number = 0, questionAnswersIds: number[] = []): Promise<number> {
  if (categoryId === 0) return 0

  const category = await getCategoryById(categoryId);
  if (!category) return 0

  const device_variant = await getDeviceVariantById(deviceVariantId);
  if (!device_variant) return 0;
  
  const { data, error }= await supabase
    .from('question_answers')
    .select(`
      id,
      weight,
      weight_type
    `)
    .eq('is_active', true)
    .in('id', questionAnswersIds)

  if (error) return 0;

  var sale_price = device_variant?.price;
  sale_price = sale_price - category?.shipping_cost;
  data?.forEach((answer) => {
    if (answer.weight_type === 'absolute') {
      sale_price = sale_price - answer.weight;
    } else if (answer.weight_type === 'percent') {
      sale_price = (sale_price * answer.weight) / 100;
    }
  });
  sale_price = (sale_price * category?.total_margin) / 100;
  return Math.ceil(sale_price);
}