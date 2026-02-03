import { NutritionInfo } from "@/hooks/useProduct";
import { Flame, Droplet, Wheat, Activity, Candy, Dna, Info } from "lucide-react";

interface NutritionFactsProps {
  info: NutritionInfo | null;
}

export function NutritionFacts({ info }: NutritionFactsProps) {
  if (!info) return null;

  const items = [
    {
      label: "Calorías",
      value: `${info.calories}`,
      unit: "kcal",
      icon: Flame,
    },
    {
      label: "Proteína",
      value: `${info.protein.value}`,
      unit: info.protein.unit,
      icon: Dna,
    },
    {
      label: "Carbohidratos",
      value: `${info.total_carbohydrates.value}`,
      unit: info.total_carbohydrates.unit,
      icon: Wheat,
    },
    {
      label: "Azúcares",
      value: `${info.sugars.value}`,
      unit: info.sugars.unit,
      icon: Candy,
    },
    {
      label: "Grasa Total",
      value: `${info.total_fat.value}`,
      unit: info.total_fat.unit,
      icon: Droplet,
    },
    {
      label: "Sodio",
      value: `${info.sodium.value}`,
      unit: info.sodium.unit,
      icon: Activity,
    },
  ];

  return (
    <div className="mt-12 p-8 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm">
      <h3 className="font-display text-2xl text-foreground mb-8 flex items-center justify-center gap-3">
        <Info className="w-5 h-5 text-gold" />
        Información Nutricional
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="group relative p-4 rounded-xl bg-background/40 border border-border/30 hover:border-gold/50 transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Icon Container */}
              <div className="mb-3 p-2.5 rounded-full bg-secondary border border-gold/20 group-hover:border-gold/60 transition-colors duration-500 shadow-lg group-hover:shadow-gold/20">
                <item.icon className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Value + Unit (as Title) */}
              <h4 className="font-display text-xl mb-1 tracking-wide text-foreground">
                {item.value}
                <span className="text-xs font-sans text-gold ml-1 font-semibold opacity-80">
                  {item.unit}
                </span>
              </h4>

              {/* Label (as Description) */}
              <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-medium group-hover:text-foreground/80 transition-colors duration-300">
                {item.label}
              </p>

              {/* Decorative Line */}
              <div className="w-6 h-[1px] bg-gold/30 mt-3 group-hover:w-12 transition-all duration-500" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground italic mt-6 opacity-60">
        *Valores aproximados por porción.
      </p>
    </div>
  );
}

