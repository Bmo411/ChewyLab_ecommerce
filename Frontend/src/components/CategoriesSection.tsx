import { Flame, Zap, Heart } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { GoldText } from "./GoldText";

const CategoriesSection = () => {
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
            Tres experiencias únicas diseñadas para despertar cada uno de tus
            sentidos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <CategoryCard
            title="Spicy Lab"
            icon={Flame}
            description="Explosión de sabor con un toque picante gourmet. Mantiene el equilibrio perfecto entre calor y dulzura."
            href="#"
          />
          <CategoryCard
            title="Sour Lab"
            icon={Zap}
            description="Notas aciduladas que despiertan los sentidos. Una experiencia vibrante que evoluciona en el paladar."
            href="#"
          />
          <CategoryCard
            title="Sweet Lab"
            icon={Heart}
            description="La dulzura clásica elevada a la perfección. Texturas suaves y sabores profundos para el alma."
            href="#"
          />
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
