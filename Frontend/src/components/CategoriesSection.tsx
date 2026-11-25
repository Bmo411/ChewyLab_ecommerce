import { Flame, Zap, Heart } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { GoldText } from "./GoldText";
import { useCategories } from '@/hooks/useCategories';

const CategoriesSection = () => {
  const { categories } = useCategories();
  const icons = [Flame, Zap, Heart];
  return (
    <section
      id="categories"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold font-body text-sm uppercase tracking-[0.3em] mb-4 inline-block">
            Nuestra Colección
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
            Explora nuestros <GoldText>Laboratorios</GoldText>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed font-light">
            Perfiles de sabor con nombres propios. La expresión facial corre por tu cuenta.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => <CategoryCard key={category.id} title={category.name} icon={icons[index % icons.length]} description={`Explora los productos y presentaciones de ${category.name}.`} href={`/coleccion?categoria=${encodeURIComponent(category.name)}`} />)}
        </div>
      </div>
      <br />
      <br />
      <br />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-gold to-transparent opacity-50" />
      </div>
    </section>
  );
};

export default CategoriesSection;
