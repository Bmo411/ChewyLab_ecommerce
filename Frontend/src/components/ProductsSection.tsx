import ProductCard from "./ProductCard";
import goldGummy from "@/assets/marketing.jpg";
import champagneGummies from "@/assets/marketing.jpg";
import fruitCollection from "@/assets/marketing.jpg";
import chocolateGummies from "@/assets/marketing.jpg";

const products = [
  {
    id: 1,
    name: "Oro Líquido",
    slug: "oro-liquido",
    description:
      "Gomitas artesanales bañadas en oro comestible 24k con esencia de miel de montaña.",
    price: "$89.00",
    image: goldGummy,
    category: "Edición Limitada",
    isNew: true,
  },
  {
    id: 2,
    name: "Champagne Rosé",
    slug: "champagne-rose",
    description:
      "Suaves gomitas con sabor a champagne francés y notas de frambuesa.",
    price: "$65.00",
    image: champagneGummies,
    category: "Signature Collection",
    isNew: false,
  },
  {
    id: 3,
    name: "Jardín de Frutas",
    slug: "jardin-de-frutas",
    description:
      "Colección de gomitas con sabores de frutas exóticas tropicales.",
    price: "$55.00",
    image: fruitCollection,
    category: "Clásicos",
    isNew: false,
  },
  {
    id: 4,
    name: "Chocolate Noir",
    slug: "chocolate-noir",
    description:
      "Ositos de gomita cubiertos de chocolate belga oscuro al 70% cacao.",
    price: "$75.00",
    image: chocolateGummies,
    category: "Premium",
    isNew: true,
  },
];

const ProductsSection = () => {
  return (
    <section id="productos" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-body text-sm uppercase tracking-[0.3em] mb-4 block">
            Nuestra Colección
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Exquisitez en cada{" "}
            <span className="text-gradient-gold italic">Bocado</span>
          </h2>
          <p className="text-muted-foreground text-lg font-light">
            Cada pieza es una obra maestra de sabor y textura, creada para
            aquellos que aprecian lo extraordinario.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              slug={product.slug}
              description={product.description}
              price={product.price}
              image={product.image}
              category={product.category}
              isNew={product.isNew}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-gold font-body uppercase tracking-widest text-sm hover:gap-4 transition-all group"
          >
            Ver toda la colección
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
