import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero.jpg';
import { brand } from '@/lib/editorial';
import { Button } from './ui/button';
import { GoldText } from './GoldText';

export default function HeroSection() {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0" aria-hidden="true">
      <img src={heroImage} alt="" className="h-full w-full object-cover" loading="eager" decoding="async" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
    <div className="relative z-10 container mx-auto px-6 pt-32 pb-24">
      <div className="max-w-2xl">
        <span className="inline-block font-body text-xs sm:text-sm uppercase tracking-[0.3em] mb-6 animate-fade-up" style={{ animationDelay: '.2s' }}><GoldText>{brand.descriptor}</GoldText></span>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-tight mb-6 animate-fade-up" style={{ animationDelay: '.4s' }}>Más que<br /><GoldText>una gomita.</GoldText></h1>
        <p className="font-display italic text-xl md:text-3xl mb-8 animate-fade-up" style={{ animationDelay: '.6s' }}>O eso queremos que creas.</p>
        <p className="text-foreground/70 text-lg md:text-xl font-body font-light leading-relaxed mb-10 max-w-xl animate-fade-up" style={{ animationDelay: '.6s' }}>Diseño de casa de subastas. Intenciones de antojo. Confitería de Guadalajara para quienes saben apreciar una buena formulación y un exceso de solemnidad.</p>
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '.8s' }}><Button variant="gold" size="xl" asChild><Link to="/coleccion">Explorar colección <ArrowUpRight className="w-4 h-4 ml-3" /></Link></Button><Button variant="luxe" size="xl" asChild><Link to="/manifiesto">Leer el manifiesto</Link></Button></div>
        <p className="technical-label text-gold/70 mt-10">GDL, MX / FORMULACIONES CON CARÁCTER</p>
      </div>
    </div>
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float" aria-hidden="true"><div className="w-px h-12 bg-gradient-to-b from-transparent via-gold to-transparent opacity-50" /></div>
  </section>;
}
