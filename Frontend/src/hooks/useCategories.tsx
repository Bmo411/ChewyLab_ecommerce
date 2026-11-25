import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getPreloadedData } from '@/lib/preloaded';
import type { Category } from '@/lib/catalog';
export type { Category } from '@/lib/catalog';

export function useCategories() {
  const initial = getPreloadedData();
  const [categories, setCategories] = useState<Category[]>(() => initial?.categories.map(category => ({ ...category, name: category.name.trim() })) || []);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id,name');
      if (cancelled) return;
      if (error) setError('No se pudieron actualizar las categorías.'); else setCategories((data || []).map(category => ({ ...category, name: category.name.trim() })));
      setLoading(false);
    };
    void fetchCategories();
    return () => { cancelled = true; };
  }, []);
  return { categories, loading, error };
}
