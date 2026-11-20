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
                ChewyLab reúne gomitas y mezclas de sabor en una colección
                que puedes explorar por producto y presentación.
              </p>
              <p>
                Descubre perfiles ácidos, picantes y botánicos, y elige
                la presentación que prefieras para compartir.
              </p>
              <p>
                Consulta los ingredientes, la información nutrimental y las
                recomendaciones de conservación en la ficha de cada producto.
              </p>
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
                    Colección de sabores
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
