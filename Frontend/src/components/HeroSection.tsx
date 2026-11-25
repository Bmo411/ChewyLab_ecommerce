import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero.jpg';
import { brand } from '@/lib/editorial';
import { Button } from './ui/button';

export default function HeroSection() {
  return <section className="relative min-h-[86vh] overflow-hidden border-b border-border pt-24 flex items-center">
    <div className="absolute inset-0 lg:left-[45%]" aria-hidden="true"><img src={heroImage} alt="" className="h-full w-full object-cover opacity-20 lg:opacity-50" loading="eager" decoding="async" /><div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" /></div>
    <div className="relative container mx-auto px-6 py-16 md:py-24">
      <div className="flex items-center gap-6 mb-12"><span className="brand-kicker">{brand.descriptor}</span><span className="h-px w-12 bg-gold" /></div>
      <h1 className="max-w-4xl font-bold text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-[-0.045em]">Más que<br />una gomita.</h1>
      <p className="text-xl md:text-3xl mt-6 mb-8 tracking-tight">O eso queremos que creas.</p>
      <p className="max-w-md text-muted-foreground leading-relaxed">Diseño de casa de subastas. Intenciones de antojo. Confitería de Guadalajara para quienes saben apreciar una buena formulación y un exceso de solemnidad.</p>
      <div className="flex flex-wrap gap-4 mt-10"><Button variant="gold" size="lg" asChild><Link to="/coleccion">Explorar colección <ArrowUpRight className="w-4 h-4 ml-3" /></Link></Button><Button variant="luxe" size="lg" asChild><Link to="/manifiesto">Leer el manifiesto</Link></Button></div>
      <p className="technical-label text-muted-foreground mt-14">GDL, MX / FORMULACIONES CON CARÁCTER</p>
    </div>
  </section>;
}
