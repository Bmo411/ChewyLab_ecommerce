import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import logo from '@/assets/ChewyLablogoSinFondo.png';
import { GoldText } from './GoldText';

export default function StorySection() {
  return <section id="historia" className="py-24 bg-secondary/30 relative overflow-hidden">
    <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true"><div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gold blur-3xl" /><div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-gold blur-3xl" /></div>
    <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
      <div><p className="text-gold font-body text-sm uppercase tracking-[0.3em] mb-4">El manifiesto</p><h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight mb-8">El empaque es serio.<br /><GoldText className="italic">El resto, con reservas.</GoldText></h2><div className="space-y-6 text-muted-foreground font-light leading-relaxed"><p>Una gomita no necesita parecer una pieza de museo. Precisamente por eso decidimos hacerlo.</p><p>Chewy Lab combina una presentación sobria con una voz que reconoce lo evidente: estamos hablando de dulces. El humor vive en el contraste; el cuidado, en el producto.</p><p>Textura, acidez y picor merecen atención. La pretensión merece, de vez en cuando, una sonrisa.</p></div><Link to="/manifiesto" className="editorial-link mt-8">Conoce la marca <ArrowUpRight className="w-4 h-4" /></Link></div>
      <div className="aspect-square bg-card rounded-lg border border-border/30 relative flex flex-col items-center justify-center p-8">
        <img src={logo} alt="Isotipo hexagonal de Chewy Lab" className="w-48 md:w-64 aspect-square object-contain brightness-125 animate-float" loading="lazy" />
        <p className="font-display text-2xl md:text-3xl"><GoldText>Chewy Lab</GoldText></p><p className="brand-kicker text-muted-foreground mt-3">Gourmet Gummy Co.</p><span className="technical-label text-gold mt-8">GUADALAJARA / MÉXICO</span>
        <div className="absolute top-6 left-6 w-12 h-12 border-l border-t border-gold/30" aria-hidden="true" /><div className="absolute top-6 right-6 w-12 h-12 border-r border-t border-gold/30" aria-hidden="true" /><div className="absolute bottom-6 left-6 w-12 h-12 border-l border-b border-gold/30" aria-hidden="true" /><div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b border-gold/30" aria-hidden="true" />
      </div>
    </div>
  </section>;
}
