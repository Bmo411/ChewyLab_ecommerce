import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Interfaces mirroring Supabase structure
interface ProductVariant {
  price: number;
  active: boolean;
}

interface ProductImage {
  image_url: string;
  is_main: boolean;
  position: number;
}

interface Category {
  name: string;
}

interface DatabaseProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  category_id: string;
  categories: Category | null;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
}

// Clean UI interface
export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      // 1. Query with joins
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id, name, slug, description, active, category_id,
          categories (name),
          product_variants (price, active),
          product_images (image_url, is_main, position)
        `
        )
        .eq("active", true);

      if (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
        setProducts([]);
        setLoading(false);
        return;
      }

      // 2. Transform Data
      const formattedProducts: ProductSummary[] = (
        data as unknown as DatabaseProduct[]
      ).map((product) => {
        // Calculate Price: Lowest active variant
        const activeVariants =
          product.product_variants?.filter((v) => v.active) || [];
        const basePrice =
          activeVariants.length > 0
            ? Math.min(...activeVariants.map((v) => v.price))
            : 0; // Or handle as "Unavailable"

        // Determine Image: Is Main > Lowest Position > Fallback
        const images = product.product_images || [];
        const mainImage =
          images.find((img) => img.is_main) ||
          images.sort((a, b) => a.position - b.position)[0];
        const imageUrl = mainImage?.image_url || "/placeholder.jpg";

        // Category Name
        const categoryName = product.categories?.name || "Sin Categoría";

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          price: basePrice,
          image_url: imageUrl,
          category_name: categoryName,
        };
      });

      setProducts(formattedProducts);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
