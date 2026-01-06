import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const QuantitySelector = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) => {
  const decrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <button
        onClick={decrease}
        disabled={quantity <= min}
        className="w-12 h-12 border border-border/50 rounded-l-lg flex items-center justify-center text-foreground hover:bg-gold/10 hover:border-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Disminuir cantidad"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-16 h-12 border-t border-b border-border/50 flex items-center justify-center bg-card">
        <span className="font-display text-lg text-foreground">{quantity}</span>
      </div>
      <button
        onClick={increase}
        disabled={quantity >= max}
        className="w-12 h-12 border border-border/50 rounded-r-lg flex items-center justify-center text-foreground hover:bg-gold/10 hover:border-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Aumentar cantidad"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;
