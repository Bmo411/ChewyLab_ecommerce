import { useParams, Link } from "react-router-dom";
import { useState } from "react";
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
import goldGummy from "@/assets/marketing.jpg";
import champagneGummies from "@/assets/marketing.jpg";
import fruitCollection from "@/assets/marketing.jpg";
import chocolateGummies from "@/assets/marketing.jpg";

// Product data - in a real app this would come from an API
const productsData = {
  "oro-liquido": {
    id: 1,
    name: "Oro Líquido",
    slug: "oro-liquido",
    description:
      "Gomitas artesanales bañadas en oro comestible 24k con esencia de miel de montaña.",
    longDescription: `Nuestras gomitas Oro Líquido representan la cúspide de la confitería de lujo. Cada pieza es cuidadosamente elaborada a mano por nuestros maestros confiteros, quienes aplican delicadas láminas de oro comestible de 24 quilates sobre una base de gomita infusionada con miel de montaña de origen controlado.

El proceso de creación toma 72 horas, durante las cuales la gomita desarrolla su textura única: suave y elástica por dentro, con un sutil crujido del oro por fuera. El sabor es una sinfonía de dulzura natural, con notas florales de la miel y un final limpio y elegante.

Cada caja contiene 12 piezas, presentadas en un estuche de terciopelo negro con cierre magnético. Ideal para ocasiones especiales, regalos corporativos de alto nivel, o simplemente para disfrutar de un momento de lujo personal.`,
    price: 89.0,
    images: [goldGummy, champagneGummies, fruitCollection],
    category: "Edición Limitada",
    isNew: true,
    ingredients: [
      "Azúcar de caña orgánica",
      "Miel de montaña",
      "Pectina natural",
      "Oro comestible 24k",
      "Extracto de vainilla",
    ],
    weight: "150g",
    pieces: "12 piezas",
    allergens: "Puede contener trazas de frutos secos",
  },
  "champagne-rose": {
    id: 2,
    name: "Champagne Rosé",
    slug: "champagne-rose",
    description:
      "Suaves gomitas con sabor a champagne francés y notas de frambuesa.",
    longDescription: `Una celebración capturada en cada bocado. Nuestras gomitas Champagne Rosé están infusionadas con auténtico champagne rosé de la región de Champagne, Francia, complementado con extracto puro de frambuesas silvestres de los Alpes.

La textura es extraordinariamente suave, casi efervescente en el paladar, evocando la sensación de las burbujas del champagne. El color rosa pálido es completamente natural, derivado de las frambuesas utilizadas en la preparación.

Presentadas en una elegante caja negra con interior de seda rosa, estas gomitas son el regalo perfecto para celebraciones, aniversarios, o para acompañar una copa de champagne en una noche especial.`,
    price: 65.0,
    images: [champagneGummies, goldGummy, chocolateGummies],
    category: "Signature Collection",
    isNew: false,
    ingredients: [
      "Champagne rosé",
      "Frambuesas silvestres",
      "Azúcar de remolacha",
      "Pectina de manzana",
      "Ácido cítrico natural",
    ],
    weight: "120g",
    pieces: "15 piezas",
    allergens: "Contiene alcohol (menos del 0.5%)",
  },
  "jardin-de-frutas": {
    id: 3,
    name: "Jardín de Frutas",
    slug: "jardin-de-frutas",
    description:
      "Colección de gomitas con sabores de frutas exóticas tropicales.",
    longDescription: `Un viaje sensorial a través de los jardines más exóticos del mundo. Esta colección presenta seis sabores únicos de frutas tropicales, cada uno elaborado con pulpa real de fruta importada directamente de su lugar de origen.

Incluye: Maracuyá de Colombia, Mango Alphonso de India, Lichi de Tailandia, Guayaba rosa de México, Pitahaya de Vietnam y Carambola de Malasia. Cada sabor es un testimonio de nuestra dedicación a la autenticidad y la excelencia.

Las gomitas mantienen la intensidad del sabor de la fruta fresca, con un equilibrio perfecto entre dulzura y acidez natural. Presentadas en un estuche compartimentado para preservar la pureza de cada sabor.`,
    price: 55.0,
    images: [fruitCollection, champagneGummies, goldGummy],
    category: "Clásicos",
    isNew: false,
    ingredients: [
      "Pulpa de frutas tropicales",
      "Azúcar de coco",
      "Pectina natural",
      "Colorantes naturales de frutas",
    ],
    weight: "180g",
    pieces: "18 piezas (3 de cada sabor)",
    allergens: "Libre de alérgenos comunes",
  },
  "chocolate-noir": {
    id: 4,
    name: "Chocolate Noir",
    slug: "chocolate-noir",
    description:
      "Ositos de gomita cubiertos de chocolate belga oscuro al 70% cacao.",
    longDescription: `La fusión perfecta entre la tradición de los ositos de gomita y la sofisticación del chocolate belga de alta gama. Cada osito está elaborado con nuestra receta clásica de gomita de frutos rojos, luego bañado en chocolate oscuro al 70% cacao de origen único de Madagascar.

El contraste entre la textura suave y frutal de la gomita y el crujiente chocolate amargo crea una experiencia gustativa incomparable. El chocolate se tempera a mano siguiendo técnicas tradicionales belgas, garantizando un acabado brillante y un snap perfecto.

Finalizados con un delicado espolvoreado de polvo de oro comestible, estos ositos representan nuestra interpretación más decadente de un clásico atemporal.`,
    price: 75.0,
    images: [chocolateGummies, goldGummy, fruitCollection],
    category: "Premium",
    isNew: true,
    ingredients: [
      "Chocolate belga 70% cacao",
      "Gomita de frutos rojos",
      "Manteca de cacao",
      "Polvo de oro comestible",
    ],
    weight: "200g",
    pieces: "16 piezas",
    allergens: "Contiene cacao. Puede contener trazas de leche y frutos secos",
  },
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = slug ? productsData[slug as keyof typeof productsData] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">
              Producto no encontrado
            </h1>
            <p className="text-muted-foreground mb-8">
              Lo sentimos, el producto que buscas no existe.
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
    toast({
      title: "Añadido al carrito",
      description: `${quantity}x ${product.name} añadido a tu carrito.`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-24">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 py-6">
          <Link
            to="/#productos"
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
              <ImageGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Product Info */}
            <div className="lg:py-8">
              {/* Category & New Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gold text-sm uppercase tracking-[0.2em] font-body">
                  {product.category}
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

              {/* Short Description */}
              <p className="text-muted-foreground text-lg font-light mb-6">
                {product.description}
              </p>

              {/* Price */}
              <div className="mb-8">
                <span className="font-display text-4xl text-gold">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-muted-foreground text-sm ml-2">MXN</span>
              </div>

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
                >
                  Añadir al Carrito
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-10 pb-10 border-b border-border/30">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isWishlisted
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
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl text-foreground mb-3">
                    Descripción
                  </h3>
                  <div className="text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                    {product.longDescription}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border/30">
                  <div>
                    <h4 className="text-foreground font-medium mb-2">
                      Ingredientes
                    </h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index}>• {ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-foreground font-medium mb-2">
                      Detalles
                    </h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• Peso: {product.weight}</li>
                      <li>• Contenido: {product.pieces}</li>
                      <li>• {product.allergens}</li>
                    </ul>
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
