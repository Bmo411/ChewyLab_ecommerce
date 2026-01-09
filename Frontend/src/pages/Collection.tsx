import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { GoldText } from "@/components/GoldText";
import { cn } from "@/lib/utils";

const Collection = () => {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter(
      (product) => product.category_name === selectedCategory
    );
  }, [products, selectedCategory]);

  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero / Header Section */}
        <section className="container mx-auto px-6 mb-12 text-center">
          <span className="text-gold font-body text-sm uppercase tracking-[0.3em] mb-4 block animate-fade-in">
            Catálogo Exclusivo
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 animate-fade-in animation-delay-200">
            Nuestros <GoldText>Laboratorios</GoldText>
          </h1>
          <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto animate-fade-in animation-delay-500">
            Explora nuestra selección de gomitas artesanales, cada una formulada
            con precisión para una experiencia única.
          </p>
        </section>

        {/* Laboratory Switcher */}
        <section className="container mx-auto px-6 mb-12">
          {isLoading ? (
            <div className="flex justify-center gap-4">
              {/* Loading Skeleton for tabs */}
              <div className="h-10 w-24 bg-muted animate-pulse rounded-full"></div>
              <div className="h-10 w-24 bg-muted animate-pulse rounded-full"></div>
              <div className="h-10 w-24 bg-muted animate-pulse rounded-full"></div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in animation-delay-800">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-all duration-300 border border-transparent",
                  selectedCategory === "all"
                    ? "bg-gold text-primary-foreground shadow-gold"
                    : "bg-transparent text-foreground/70 hover:text-gold hover:border-gold/30"
                )}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-all duration-300 border border-transparent",
                    selectedCategory === category.name
                      ? "bg-gold text-primary-foreground shadow-gold"
                      : "bg-transparent text-foreground/70 hover:text-gold hover:border-gold/30"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-muted animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in animation-delay-1000">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    slug={product.slug}
                    description={product.description}
                    price={`$${product.price.toFixed(2)}`}
                    image={product.image_url}
                    category={product.category_name}
                    isNew={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No hay productos en esta categoría por el momento.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
