import { useEffect, useState } from 'react'
import { getCategories, CategorialQuestions, getCategorialQuestions } from '../services/categoryService'
import { Category } from '../types/category';

export function useCategories() {
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

export function useCategorialQuestions(categoryId: number | null, deviceId: number | null) {
  const [categorialQuestions, setCategorialQuestions] = useState<CategorialQuestions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId == null) {
      setCategorialQuestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getCategorialQuestions(categoryId);
        if (isMounted) setCategorialQuestions(data);
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      isMounted = false; // cleanup to prevent state update on unmounted component
    };
  }, [categoryId]);


  return { categorialQuestions, loading, error };
}