import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getPreloadedData } from '@/lib/preloaded';
import { toProduct, type CatalogRow, type ProductFull } from '@/lib/catalog';
export type { ProductVariant, ProductImage, ProductDetails, ProductFull, NutritionValue, NutritionInfo } from '@/lib/catalog';

export function useProduct(slug: string | undefined) {
  const initial = getPreloadedData()?.products.find(p => p.slug === slug);
  const [product, setProduct] = useState<ProductFull | null>(() => initial ? toProduct(initial) : null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const cached = getPreloadedData()?.products.find(p => p.slug === slug);
    setProduct(cached ? toProduct(cached) : null);
    setLoading(!cached);
    setError(null);
    if (!slug) { setLoading(false); return; }
    const fetchProduct = async () => {
      try {
        const result = await supabase.from('products').select('id,name,slug,description,active,created_at,categories(name),product_variants(*),product_images(*),product_details(*)').eq('slug', slug).eq('active', true).maybeSingle();
        if (cancelled) return;
        if (result.error) throw result.error;
        setProduct(result.data ? toProduct(result.data as unknown as CatalogRow) : null);
      } catch {
        if (!cancelled && !cached) setError('No se pudo cargar el producto.');
      } finally { if (!cancelled) setLoading(false); }
    };
    void fetchProduct();
    return () => { cancelled = true; };
  }, [slug]);
  return { product, loading, error };
}
