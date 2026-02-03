import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import QuantitySelector from "@/components/QuantitySelector";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useProduct, ProductVariant } from "@/hooks/useProduct";
import { IngredientsList } from "@/components/product/IngredientsList";
import { NutritionFacts } from "@/components/product/NutritionFacts";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { product, loading, error } = useProduct(slug);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  // Set default variant when product loads
  useEffect(() => {
    if (product && product.variants.length > 0) {
      // Default to the first variant or calculate cheapest/most popular
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24 text-center">
          <div className="animate-pulse">Cargando producto...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">
              Producto no encontrado
            </h1>
            <p className="text-muted-foreground mb-8">
              Lo sentimos, el producto que buscas no existe o ha sido
              desactivado.
            </p>
            <Link to="/">
              <Button variant="hero">Volver al inicio</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    toast({
      title: "Añadido al carrito",
      description: `${quantity}x ${product.name} (${selectedVariant.weight}) añadido a tu carrito.`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.details.long_description || product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace del producto ha sido copiado al portapapeles.",
      });
    }
  };

  const images = product.images.map((img) => img.image_url);
  // Fallback if no images
  if (images.length === 0) images.push("/placeholder.jpg");

  const currentPrice = selectedVariant ? selectedVariant.price : 0;
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : true;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-24">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 py-6">
          <Link
            to="/coleccion"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la colección</span>
          </Link>
        </div>

        {/* Product Content */}
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div>
              <ImageGallery images={images} productName={product.name} />
              <NutritionFacts info={product.details.nutrition_info} />
            </div>

            {/* Product Info */}
            <div className="lg:py-8">
              {/* Category & New Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gold text-sm uppercase tracking-[0.2em] font-body">
                  {product.category_name}
                </span>
                {product.isNew && (
                  <span className="bg-gold text-primary-foreground px-3 py-1 text-xs uppercase tracking-widest font-semibold rounded">
                    Nuevo
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                {product.name}
              </h1>

              {/* Short Description (Long description used here as summary if needed, or specific short desc if added later) */}
              <p className="text-muted-foreground text-lg font-light mb-6">
                {/* Using long description truncated or a placeholder logic if separate short desc desired */}
                {product.details.long_description?.substring(0, 150)}...
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="font-display text-4xl text-gold">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className="text-muted-foreground text-sm ml-2">MXN</span>
              </div>

              {/* Variant Selector (Weight) */}
              {product.variants.length > 0 && (
                <div className="mb-8">
                  <label className="text-sm font-medium text-foreground block mb-3">
                    Presentación (Peso)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 border rounded-md text-sm transition-all ${selectedVariant?.id === variant.id
                          ? "border-gold bg-gold/10 text-gold font-semibold"
                          : "border-border text-muted-foreground hover:border-gold/50"
                          }`}
                      >
                        {variant.weight}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
                <Button
                  variant="hero"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Agotado" : "Añadir al Carrito"}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-10 pb-10 border-b border-border/30">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex items-center gap-2 text-sm transition-colors ${isWishlisted
                    ? "text-gold"
                    : "text-muted-foreground hover:text-gold"
                    }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                  />
                  <span>Favoritos</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Compartir</span>
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 border border-gold/30 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Envío Express
                  </span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 border border-gold/30 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Pago Seguro
                  </span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 border border-gold/30 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Garantía
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-8">
                <div>
                  <h3 className="font-display text-xl text-foreground mb-3">
                    Descripción
                  </h3>
                  <div className="text-muted-foreground font-light leading-relaxed whitespace-pre-line text-lg">
                    {product.details.long_description ||
                      "Sin descripción detallada."}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="pt-6 border-t border-border/30">
                  <h4 className="font-display text-lg text-foreground mb-4">
                    Ingredientes
                  </h4>
                  {product.details.ingredients ? (
                    <IngredientsList
                      ingredients={product.details.ingredients}
                    />
                  ) : (
                    <p className="text-muted-foreground">No especificado.</p>
                  )}
                </div>

                {/* Additional Info Grid */}
                <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border/30">
                  {/* Storage */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gold" />
                      Almacenamiento
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {product.details.storage_info ||
                        "Conservar en lugar fresco y seco."}
                    </p>
                  </div>

                  {/* Usage */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gold" />
                      Sugerencia de Uso
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {product.details.usage_info ||
                        "Ideal para compartir en fiestas o como snack."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
