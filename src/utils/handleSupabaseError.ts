export function handleSupabaseError(operation: string, error: any) {
  console.error(`${operation} failed:`, error.message || error)
  return []
}