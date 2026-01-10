import { NutritionInfo, NutritionValue } from "@/hooks/useProduct";
import { Flame, Droplet, Wheat, Beef, Candy, Zap } from "lucide-react";

interface NutritionFactsProps {
  nutrition: NutritionInfo | null;
}

const NutritionFacts = ({ nutrition }: NutritionFactsProps) => {
  if (!nutrition) return null;

  // Helper to safely format value and unit
  const formatValue = (item: NutritionValue | number | undefined) => {
    if (typeof item === "number") return `${item}`;
    if (item && typeof item === "object")
      return `${item.value}${item.unit || ""}`;
    return "0";
  };

  return (
    <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
      <h3 className="font-display text-lg mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-gold" />
        Información Nutricional
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Calories */}
        <div className="bg-background/50 p-3 rounded border border-border/30 flex flex-col items-center justify-center text-center">
          <div className="mb-1 text-gold">
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground">
            {formatValue(nutrition.calories)}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Calorías
          </span>
        </div>

        {/* Protein */}
        <div className="bg-background/50 p-3 rounded border border-border/30 flex flex-col items-center justify-center text-center">
          <div className="mb-1 text-gold">
            <Beef className="w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            {formatValue(nutrition.protein)}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Proteína
          </span>
        </div>

        {/* Carbs */}
        <div className="bg-background/50 p-3 rounded border border-border/30 flex flex-col items-center justify-center text-center">
          <div className="mb-1 text-gold">
            <Wheat className="w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            {formatValue(nutrition.total_carbohydrates)}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Carbohidratos
          </span>
        </div>

        {/* Sugars */}
        <div className="bg-background/50 p-3 rounded border border-border/30 flex flex-col items-center justify-center text-center">
          <div className="mb-1 text-gold">
            <Candy className="w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            {formatValue(nutrition.sugars)}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Azúcares
          </span>
        </div>

        {/* Fat */}
        <div className="bg-background/50 p-3 rounded border border-border/30 flex flex-col items-center justify-center text-center">
          <div className="mb-1 text-gold">
            <Droplet className="w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            {formatValue(nutrition.total_fat)}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Grasas
          </span>
        </div>

        {/* Sodium - Often good to show if high, otherwise maybe skip or replace */}
        <div className="bg-background/50 p-3 rounded border border-border/30 flex flex-col items-center justify-center text-center">
          <div className="mb-1 text-gold">
            <span className="text-xs font-bold border border-gold rounded px-1">
              Na
            </span>
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            {formatValue(nutrition.sodium)}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Sodio
          </span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-4 text-center">
        *Valores aproximados por porción estándar.
      </p>
    </div>
  );
};

export default NutritionFacts;
