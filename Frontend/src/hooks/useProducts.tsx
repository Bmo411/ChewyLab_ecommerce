import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getPreloadedData } from '@/lib/preloaded';
import { toSummary, type CatalogRow, type ProductSummary } from '@/lib/catalog';
export type { ProductSummary } from '@/lib/catalog';

export function useProducts() {
  const initial = getPreloadedData();
  const [products, setProducts] = useState<ProductSummary[]>(() => initial?.products.map(toSummary) || []);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        const result = await supabase.from('products').select('id,name,slug,description,active,created_at,categories(name),product_variants(*),product_images(*),product_details(*)').eq('active', true);
        if (result.error) throw result.error;
        if (!cancelled) setProducts((result.data as unknown as CatalogRow[]).map(toSummary));
      } catch {
        if (!cancelled) setError('No se pudo actualizar el catálogo.');
      } finally { if (!cancelled) setLoading(false); }
    };
    void fetchProducts();
    return () => { cancelled = true; };
  }, []);
  return { products, loading, error };
}
