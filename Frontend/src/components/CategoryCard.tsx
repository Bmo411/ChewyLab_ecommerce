import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  href?: string;
}

export const CategoryCard = ({
  title,
  icon: Icon,
  description,
  href = "#",
}: CategoryCardProps) => {
  return (
    <a
      href={href}
      className="group relative block p-8 rounded-xl bg-gradient-card border border-border/50 hover:border-gold/50 transition-all duration-500 hover:-translate-y-2"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon Container using div instead of button structure for cleaner link semantics inside a */}
        <div className="mb-6 p-4 rounded-full bg-secondary border border-gold/20 group-hover:border-gold/60 transition-colors duration-500 shadow-lg group-hover:shadow-gold/20">
          <Icon className="w-8 h-8 text-gold group-hover:scale-110 transition-transform duration-500" />
        </div>

        <h3 className="font-display text-2xl mb-3 tracking-wide">
          <span className="group-hover:text-gold transition-colors duration-300">
            {title}
          </span>
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
          {description}
        </p>

        {/* Decorative thin line */}
        <div className="w-12 h-[1px] bg-gold/30 mt-6 group-hover:w-24 transition-all duration-500" />
      </div>
    </a>
  );
};
