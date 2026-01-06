import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  category: string;
  isNew?: boolean;
  className?: string;
}

const ProductCard = ({
  name,
  slug,
  description,
  price,
  image,
  category,
  isNew = false,
  className,
}: ProductCardProps) => {
  return (
    <article
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden border border-border/30 transition-all duration-500 hover:border-gold/50 hover:shadow-gold",
        className
      )}
    >
      <Link to={`/producto/${slug}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* New Badge */}
          {isNew && (
            <span className="absolute top-4 left-4 bg-gold text-primary-foreground px-3 py-1 text-xs uppercase tracking-widest font-semibold rounded">
              Nuevo
            </span>
          )}

          {/* View Details Button */}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-gold text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-semibold hover:bg-gold-light">
            Ver Detalles
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <span className="text-muted-foreground text-xs uppercase tracking-widest font-body mb-2 block">
            {category}
          </span>
          <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-gold transition-colors">
            {name}
          </h3>
          <p className="text-muted-foreground text-sm font-light mb-4 line-clamp-2">
            {description}
          </p>
          <span className="text-gold font-display text-2xl">{price}</span>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
