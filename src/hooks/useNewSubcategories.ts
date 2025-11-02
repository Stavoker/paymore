import { useEffect, useState } from 'react'
import { Subcategory, getSubcategories } from '../services/subcategoryService'

export function useSubcategories(categoryId: number | null) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!categoryId) return
    setLoading(true)
    getSubcategories(categoryId).then((data) => {
      setSubcategories(data)
      setLoading(false)
    })
  }, [categoryId])

  return { subcategories, loading }
}
