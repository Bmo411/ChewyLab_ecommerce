import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/30 py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-display text-2xl text-gradient-gold font-semibold block mb-4">
              CHEWYLAB
            </span>
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              Confitería artesanal de lujo para los paladares más exigentes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-foreground text-lg mb-6">
              Colección
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm"
                >
                  Edición Limitada
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm"
                >
                  Signature Collection
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm"
                >
                  Clásicos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm"
                >
                  Regalos Corporativos
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-foreground text-lg mb-6">
              Compañía
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm"
                >
                  Nuestra Historia
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm"
                >
                  Ingredientes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm"
                >
                  Sostenibilidad
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-foreground text-lg mb-6">
              Contáctanos
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>hola@chewylab.com</li>
              <li>+52 55 1234 5678</li>
              <li>Ciudad de México, México</li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 border border-border/50 rounded-full flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-border/50 rounded-full flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-border/50 rounded-full flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © 2025 ChewyLab. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-gold transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              Términos y Condiciones
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              Envíos y Devoluciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
