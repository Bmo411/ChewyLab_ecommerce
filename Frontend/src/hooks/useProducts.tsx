import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  active: boolean;
  created_at: string;
  categories: {
    name: string;
  } | null;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("active", true);
      console.log("data: ", data);
      console.log("error: ", error);

      if (error) {
        setError(error.message);
      } else {
        // @ts-ignore
        setProducts(data ?? []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);
  return { products, loading, error };
}
