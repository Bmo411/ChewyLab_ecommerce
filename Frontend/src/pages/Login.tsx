import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import logo from "@/assets/ChewyLablogoSinFondo.png";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "¡Bienvenido!",
        description: `Has iniciado sesión como ${data.user.email}`,
      });

      // Redirigir a la página principal
      setTimeout(() => navigate("/"), 1000);
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description:
          error.message === "Invalid login credentials"
            ? "Credenciales inválidas. Verifica tu email y contraseña."
            : error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center relative overflow-hidden p-4 pt-12">
      {/* Golden dust particles background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0">
          {/* Multiple golden dust particles */}
          <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-primary rounded-full opacity-60 animate-float-dust"></div>
          <div className="absolute top-[20%] left-[80%] w-1.5 h-1.5 bg-gold rounded-full opacity-40 animate-float-dust animation-delay-1000"></div>
          <div className="absolute top-[30%] left-[25%] w-1 h-1 bg-primary rounded-full opacity-70 animate-float-dust animation-delay-2000"></div>
          <div className="absolute top-[40%] left-[70%] w-2.5 h-2.5 bg-gold rounded-full opacity-50 animate-float-dust animation-delay-3000"></div>
          <div className="absolute top-[50%] left-[10%] w-1.5 h-1.5 bg-primary rounded-full opacity-60 animate-float-dust animation-delay-4000"></div>
          <div className="absolute top-[60%] left-[85%] w-2 h-2 bg-gold rounded-full opacity-45 animate-float-dust animation-delay-500"></div>
          <div className="absolute top-[70%] left-[40%] w-1 h-1 bg-primary rounded-full opacity-65 animate-float-dust animation-delay-1500"></div>
          <div className="absolute top-[80%] left-[60%] w-1.5 h-1.5 bg-gold rounded-full opacity-55 animate-float-dust animation-delay-2500"></div>
          <div className="absolute top-[15%] left-[50%] w-2 h-2 bg-primary rounded-full opacity-50 animate-float-dust animation-delay-3500"></div>
          <div className="absolute top-[25%] left-[90%] w-1 h-1 bg-gold rounded-full opacity-70 animate-float-dust animation-delay-4500"></div>
          <div className="absolute top-[35%] left-[5%] w-1.5 h-1.5 bg-primary rounded-full opacity-60 animate-float-dust animation-delay-800"></div>
          <div className="absolute top-[45%] left-[95%] w-2.5 h-2.5 bg-gold rounded-full opacity-40 animate-float-dust animation-delay-1800"></div>
          <div className="absolute top-[55%] left-[30%] w-1 h-1 bg-primary rounded-full opacity-75 animate-float-dust animation-delay-2800"></div>
          <div className="absolute top-[65%] left-[75%] w-2 h-2 bg-gold rounded-full opacity-50 animate-float-dust animation-delay-3800"></div>
          <div className="absolute top-[75%] left-[20%] w-1.5 h-1.5 bg-primary rounded-full opacity-65 animate-float-dust animation-delay-200"></div>
          <div className="absolute top-[85%] left-[55%] w-1 h-1 bg-gold rounded-full opacity-55 animate-float-dust animation-delay-1200"></div>
          <div className="absolute top-[5%] left-[65%] w-2 h-2 bg-primary rounded-full opacity-45 animate-float-dust animation-delay-2200"></div>
          <div className="absolute top-[90%] left-[35%] w-1.5 h-1.5 bg-gold rounded-full opacity-70 animate-float-dust animation-delay-3200"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo with floating animation */}
        <div className="flex justify-center mb-16">
          <img
            src={logo}
            alt="ChewyLab Logo"
            className="h-32 w-auto animate-float"
          />
        </div>

        <Card className="border-2 border-primary shadow-lg relative overflow-hidden bg-card/95 backdrop-blur-sm animate-border-glow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-display text-center text-gradient-gold">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Regístrate
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
