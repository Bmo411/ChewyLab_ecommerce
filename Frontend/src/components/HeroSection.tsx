import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.jpg";
import { GoldText } from "./GoldText";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-24">
        <div className="max-w-2xl">
          <span
            className="inline-block text-gold font-body text-sm uppercase tracking-[0.3em] mb-6 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <GoldText>Gomitas de lujo</GoldText>
          </span>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-tight mb-6 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            Sabor que <GoldText>Trasciende</GoldText>
          </h1>

          <p
            className="text-foreground/70 text-lg md:text-xl font-body font-light leading-relaxed mb-10 max-w-xl animate-fade-up"
            style={{ animationDelay: "0.6s" }}
          >
            Descubre nuestra exclusiva colección de gomitas artesanales,
            elaboradas con los ingredientes más selectos para una experiencia
            sensorial única.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-up"
            style={{ animationDelay: "0.8s" }}
          >
            <Button variant="gold" size="xl">
              Explorar Colección
            </Button>
            <Button variant="luxe" size="xl">
              Nuestra Historia
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-gold to-transparent opacity-50" />
      </div>
    </section>
  );
};

export default HeroSection;
