const StorySection = () => {
  return (
    <section
      id="historia"
      className="py-24 bg-secondary/30 relative overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-gold font-body text-sm uppercase tracking-[0.3em] mb-4 block">
              Nuestra Historia
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              Tradición artesanal,{" "}
              <span className="text-gradient-gold italic">
                elegancia moderna
              </span>
            </h2>

            <div className="space-y-6 text-muted-foreground font-light leading-relaxed">
              <p>
                Desde 2025, ChewyLab ha redefinido el concepto de gomitas de
                lujo. Nuestro compromiso con la excelencia nos ha llevado a
                cuidar nuestros procesos y gomitas con todo el amor del mundo.
              </p>
              <p>
                Cada sabor es elaborado a mano utilizando técnicas tradicionales
                combinadas con innovación culinaria, garantizando una
                experiencia sensorial incomparable.
              </p>
              <p>
                Utilizamos únicamente ingredientes de la más alta calidad:
                extractos de frutas orgánicas, miel de origen controlado y
                colorantes naturales derivados de plantas.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-border/30">
              <div>
                <span className="font-display text-4xl text-gold block mb-2">
                  50+
                </span>
                <span className="text-muted-foreground text-sm uppercase tracking-widest">
                  Sabores
                </span>
              </div>
              <div>
                <span className="font-display text-4xl text-gold block mb-2">
                  12
                </span>
                <span className="text-muted-foreground text-sm uppercase tracking-widest">
                  Países
                </span>
              </div>
              <div>
                <span className="font-display text-4xl text-gold block mb-2">
                  100%
                </span>
                <span className="text-muted-foreground text-sm uppercase tracking-widest">
                  Orgánico
                </span>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="aspect-square bg-card rounded-lg border border-border/30 overflow-hidden relative">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <div className="w-20 h-20 border border-gold/50 rounded-full flex items-center justify-center">
                      <span className="font-display text-gold text-3xl italic">
                        L
                      </span>
                    </div>
                  </div>
                  <span className="font-display text-foreground text-2xl block mb-2">
                    ChewyLab
                  </span>
                  <span className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                    Est. 2025
                  </span>
                </div>
              </div>

              {/* Corner Decorations */}
              <div className="absolute top-6 left-6 w-16 h-16 border-l border-t border-gold/30" />
              <div className="absolute top-6 right-6 w-16 h-16 border-r border-t border-gold/30" />
              <div className="absolute bottom-6 left-6 w-16 h-16 border-l border-b border-gold/30" />
              <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-gold/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
