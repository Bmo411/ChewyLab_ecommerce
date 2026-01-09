import { Button } from "@/components/ui/button";
import { useState } from "react";
// import { toast } from "@/hooks/use-toast";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // toast({
      //   title: "¡Bienvenido al club!",
      //   description: "Recibirás nuestras exclusivas ofertas muy pronto.",
      // });
      setEmail("");
    }
  };

  return (
    <section
      id="contacto"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-gold font-body text-sm uppercase tracking-[0.3em] mb-4 block">
            Club Exclusivo
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
            Únete a la{" "}
            <span className="text-gradient-gold italic">Experiencia</span>
          </h2>
          <p className="text-muted-foreground text-lg font-light mb-10">
            Sé el primero en conocer nuestras nuevas colecciones, ofertas
            exclusivas y eventos especiales.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-10 px-6 bg-secondary border border-border/50 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors font-body"
              required
            />
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="sm:w-auto"
              onClick={handleSubmit}
            >
              Suscribirse
            </Button>
          </form>

          <p className="text-muted-foreground text-xs mt-6">
            Al suscribirte, aceptas recibir comunicaciones de ChewyLab. Puedes
            darte de baja en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
