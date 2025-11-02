import { useEffect, useState } from 'react'
import { Category, getCategories } from '../services/categoryService'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data)
      setLoading(false)
    })
  }, [])

  return { categories, loading }
}
