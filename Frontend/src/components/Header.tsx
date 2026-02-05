import { ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { GoldText } from "./GoldText";
import logo from "../assets/ChewyLablogoSinFondo.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdowm-menu";

import { useCart } from "@/hooks/useCart";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { cart, setIsOpen } = useCart();
  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30">
      <nav className="container mx-auto px-6 py-4 flex items-center h-18">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <a href="/" className="flex items-center">
            <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
              <img
                src={logo}
                alt="Logo"
                className="h-full w-full object-contain scale-150 brightness-125"
              />
            </div>
            <span className="font-display text-2xl md:text-3xl text-gradient-gold font-semibold tracking-wide">
              <GoldText>ChewyLab</GoldText>
            </span>
          </a>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 justify-center">
          <a
            href="/coleccion"
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

        {/* Right: Cart & Mobile Menu */}
        <div className="flex-1 flex justify-end items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Mi cuenta
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/login")}
            >
              <User className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold animate-in zoom-in-50">
                {itemCount}
              </span>
            )}
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
              href="/coleccion"
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
