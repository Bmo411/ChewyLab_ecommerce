import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface ProductVariant {
  id: string;
  weight: string;
  price: number;
  stock: number;
  active: boolean;
  sku: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_main: boolean;
  position: number;
}


export interface NutritionValue {
  unit: string;
  value: number;
}

export interface NutritionInfo {
  sodium: NutritionValue;
  sugars: NutritionValue;
  protein: NutritionValue;
  calories: number;
  total_fat: NutritionValue;
  total_carbohydrates: NutritionValue;
}

export interface ProductDetails {
  long_description: string | null;
  ingredients: string | null;
  nutrition_info: NutritionInfo | null; // Changed from string to object
  storage_info: string | null;
  usage_info: string | null;
}


export interface ProductFull {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  details: ProductDetails;
  isNew: boolean; // Computed or from DB if added later
}

interface DatabaseResponse {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
  categories: { name: string } | null;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
  product_details: ProductDetails | ProductDetails[]; // Handle both just in case, but user log shows object
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<ProductFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id, name, slug, active, created_at,
          categories (name),
          product_variants (*),
          product_images (*),
          product_details (*)
        `
        )
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        setError(error.message);
        // Debug toast
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: "Error cargando productos (Auth)",
            description: error.message + " " + error.details,
            variant: "destructive",
            duration: 5000
          });
        });
        setProduct(null);
      } else if (data) {
        // Transform Data
        const dbProduct = data as unknown as DatabaseResponse;

        // Sort images by position or main
        const sortedImages = (dbProduct.product_images || []).sort((a, b) => {
          if (a.is_main) return -1;
          if (b.is_main) return 1;
          return a.position - b.position;
        });

        // Filter active variants
        const activeVariants = (dbProduct.product_variants || []).filter(
          (v) => v.active
        );

        // Get details - handle if it's an object or array
        let detailsData: ProductDetails | null = null;

        if (Array.isArray(dbProduct.product_details)) {
          detailsData = dbProduct.product_details[0] || null;
        } else if (dbProduct.product_details) {
          detailsData = dbProduct.product_details;
        }

        const details = detailsData || {
          long_description: null,
          ingredients: null,
          nutrition_info: null,
          storage_info: null,
          usage_info: null,
        };

        // Check if new (e.g. created in last 30 days) - simplified logic
        const isNew =
          new Date(dbProduct.created_at).getTime() >
          Date.now() - 30 * 24 * 60 * 60 * 1000;

        setProduct({
          id: dbProduct.id,
          name: dbProduct.name,
          slug: dbProduct.slug,
          category_name: dbProduct.categories?.name || "Sin Categoría",
          active: dbProduct.active,
          images: sortedImages,
          variants: activeVariants,
          details: details,
          isNew: isNew,
        });
      }

      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
}
