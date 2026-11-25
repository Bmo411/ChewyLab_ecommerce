export interface ProductVariant { id: string; weight: string; price: number; stock: number; active: boolean; sku: string; }
export interface ProductImage { id: string; image_url: string; is_main: boolean; position: number; }
export interface NutritionValue { unit: string; value: number; }
export interface NutritionInfo { sodium: NutritionValue; sugars: NutritionValue; protein: NutritionValue; calories: number; total_fat: NutritionValue; total_carbohydrates: NutritionValue; }
export interface ProductDetails { long_description: string | null; ingredients: string | null; nutrition_info: NutritionInfo | null; storage_info: string | null; usage_info: string | null; }
export interface ProductFull { id: string; name: string; slug: string; category_name: string; active: boolean; images: ProductImage[]; variants: ProductVariant[]; details: ProductDetails; isNew: boolean; }
export interface ProductSummary { id: string; name: string; slug: string; description: string; price: number; image_url: string; category_name: string; }
export interface Category { id: string; name: string; }
export interface CatalogRow {
  id: string; name: string; slug: string; description: string | null; active: boolean; created_at: string;
  categories: { name: string } | null; product_variants: ProductVariant[]; product_images: ProductImage[];
  product_details: ProductDetails | ProductDetails[] | null;
}
export interface CatalogSnapshot { products: CatalogRow[]; categories: Category[]; }
export function formatWeight(weight: string | number) { const value = String(weight).trim(); return /^\d+(?:\.\d+)?$/.test(value) ? `${value} g` : value; }

export function toProduct(row: CatalogRow): ProductFull {
  return {
    id: row.id, name: row.name, slug: row.slug, category_name: row.categories?.name?.trim() || 'Sin categoría', active: row.active,
    images: [...(row.product_images || [])].sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.position - b.position),
    variants: (row.product_variants || []).filter(v => v.active).map(v => ({ ...v, price: Number(v.price), stock: Number(v.stock) })),
    details: (Array.isArray(row.product_details) ? row.product_details[0] : row.product_details) || { long_description: null, ingredients: null, nutrition_info: null, storage_info: null, usage_info: null },
    isNew: new Date(row.created_at).getTime() > Date.now() - 30 * 86400_000,
  };
}
export function toSummary(row: CatalogRow): ProductSummary {
  const full = toProduct(row);
  return { id: row.id, name: row.name, slug: row.slug, description: row.description || '', price: full.variants.length ? Math.min(...full.variants.map(v => v.price)) : 0, image_url: full.images[0]?.image_url || '/placeholder.svg', category_name: full.category_name };
}
