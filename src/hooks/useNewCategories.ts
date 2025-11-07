import { useEffect, useState } from 'react'
import { Category, getCategories } from '../services/categoryService'

export function useNewCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
        getCategories().then((data) => {
        setCategories(data)
        setLoading(false)
        setError(null);
        })
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setLoading(false);
    }
  }, [])

  return { categories, loading, error }
}