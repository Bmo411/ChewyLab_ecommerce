import React from "react";

interface GoldTextProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const GoldText: React.FC<GoldTextProps> = ({
  children,
  className = "",
  as: Component = "span",
}) => {
  return (
    <Component
      className={`bg-gradient-to-r from-gold via-gold-light to-gold bg-[size:200%_auto] animate-shimmer bg-clip-text text-transparent ${className}`}
    >
      {children}
    </Component>
  );
};

export const GoldTextHover: React.FC<GoldTextProps> = ({
  children,
  className = "",
  as: Component = "span",
}) => {
  return (
    <Component
      className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-gold hover:via-gold-light hover:to-gold hover:animate-shimmer hover:bg-[size:200%_auto] hover:bg-clip-text hover:text-transparent ${className}`}
    >
      {children}
    </Component>
  );
};
