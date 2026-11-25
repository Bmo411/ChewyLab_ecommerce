import { ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import logo from "../assets/ChewyLablogoSinFondo.png";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { navigation, brand } from '@/lib/editorial';
import { GoldText } from './GoldText';
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
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { cart, setIsOpen } = useCart();
  const { toast } = useToast();
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
    setUser(null);
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30">
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <nav aria-label="Navegación principal" className="container mx-auto px-6 flex items-center py-4">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" aria-label="Chewy Lab, inicio" className="flex items-center gap-2">
            <div className="h-10 w-10 md:h-14 md:w-14 flex items-center justify-center overflow-hidden">
              <img
                src={logo}
                alt=""
                className="h-24 w-24 max-w-none object-contain brightness-125"
              />
            </div>
            <span className="font-display text-lg sm:text-2xl md:text-3xl font-semibold tracking-wide whitespace-nowrap">
              <GoldText>{brand.name}</GoldText>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-7 justify-center">
          {navigation.map(item => <NavLink key={item.path} to={item.path} className={({ isActive }) => `brand-kicker transition-colors hover:text-gold ${isActive ? 'text-gold' : 'text-foreground/80'}`}>{item.label}</NavLink>)}
        </div>

        {/* Right: Cart & Mobile Menu */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir mi cuenta">
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
              aria-label="Iniciar sesión"
              onClick={() => navigate("/login")}
            >
              <User className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Abrir carrito, ${itemCount} productos`}
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
            className="lg:hidden text-foreground"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
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
        <div id="mobile-navigation" className="lg:hidden bg-background border-t border-border">
          <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {navigation.map(item => <NavLink key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `brand-kicker py-3 transition-colors hover:text-gold ${isActive ? 'text-gold' : 'text-foreground/80'}`}>{item.label}</NavLink>)}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
