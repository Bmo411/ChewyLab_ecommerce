import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductsSection = () => {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <section className="py-24 text-center">
        <p>Cargando productos...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 text-center text-red-500">
        <p>Error al cargar productos</p>
      </section>
    );
  }

  return (
    <section id="productos" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-body text-sm uppercase tracking-[0.3em] mb-4 block">
            Nuestra Colección
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
            Exquisitez en cada{" "}
            <span className="text-gradient-gold italic">Bocado</span>
          </h2>
          <p className="text-muted-foreground text-lg font-light">
            Cada pieza es una obra maestra de sabor y textura.
          </p>
        </div>

        {/* Carousel */}
        <div className="flex flex-col items-center justify-between w-full max-w-7xl mx-auto px-4">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent
              className="justify-center"
              style={{ flexWrap: "wrap" }}
            >
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-6"
                >
                  <ProductCard
                    name={product.name}
                    slug={product.slug}
                    description={product.description}
                    price={`$${product.price.toFixed(2)}`}
                    image={product.image_url}
                    category={product.category_name}
                    isNew={false}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Button */}
        <div className="text-center mt-12">
          <a
            className="inline-flex items-center gap-2 text-gold uppercase tracking-widest text-sm"
            href="/coleccion"
          >
            Ver toda la colección →
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
