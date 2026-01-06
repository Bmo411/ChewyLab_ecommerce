import { ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GoldText } from "./GoldText";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl md:text-3xl text-gradient-gold font-semibold tracking-wide">
            <GoldText>ChewyLab</GoldText>
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#productos"
            className="text-foreground/80 hover:text-gold transition-colors font-body text-sm uppercase tracking-widest"
          >
            Colección
          </a>
          <a
            href="#historia"
            className="text-foreground/80 hover:text-gold transition-colors font-body text-sm uppercase tracking-widest"
          >
            Historia
          </a>
          <a
            href="#contacto"
            className="text-foreground/80 hover:text-gold transition-colors font-body text-sm uppercase tracking-widest"
          >
            Contacto
          </a>
        </div>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
              0
            </span>
          </Button>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border/30 animate-fade-in">
          <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
            <a
              href="#productos"
              className="text-foreground/80 hover:text-gold transition-colors font-body text-sm uppercase tracking-widest py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Colección
            </a>
            <a
              href="#historia"
              className="text-foreground/80 hover:text-gold transition-colors font-body text-sm uppercase tracking-widest py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Historia
            </a>
            <a
              href="#contacto"
              className="text-foreground/80 hover:text-gold transition-colors font-body text-sm uppercase tracking-widest py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contacto
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
