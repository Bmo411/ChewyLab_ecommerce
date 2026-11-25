import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { brand, editorialPages } from '@/lib/editorial';

export function EditorialLayout({ path, children, paper = false }: { path: string; children: ReactNode; paper?: boolean }) {
  const page = editorialPages[path];
  return <div className="min-h-screen bg-background"><Header />
    <main id="contenido" className="pt-24">
      <section className="editorial-heading container mx-auto px-6 py-14 md:py-20">
        <div className="flex items-center justify-between gap-6 border-t border-gold/50 pt-5 mb-12">
          <p className="brand-kicker">{brand.descriptor}</p><span className="technical-label">{page.code}</span>
        </div>
        <nav aria-label="Ruta de navegación" className="text-xs text-muted-foreground mb-6"><Link to="/" className="hover:text-foreground">Inicio</Link><span className="mx-3" aria-hidden="true">/</span><span>{page.label}</span></nav>
        <h1 className="max-w-5xl text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-[-0.04em]">{page.title}</h1>
        <p className="mt-7 max-w-2xl text-base md:text-xl leading-relaxed text-muted-foreground">{page.intro}</p>
        {page.review && <p role="note" className="mt-8 max-w-2xl border-l border-gold pl-4 text-sm leading-relaxed text-muted-foreground">Información preliminar. La identidad y domicilio del responsable y las condiciones finales están en revisión antes de habilitar ventas.</p>}
      </section>
      <div className={paper ? 'editorial-paper' : ''}><div className="container mx-auto px-6 py-14 md:py-20">{children}</div></div>
      <section className="container mx-auto px-6 py-12 md:py-16 border-t border-border">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div><p className="brand-kicker mb-3">Suficiente teoría</p><h2 className="text-2xl md:text-4xl font-semibold">El experimento está en la colección.</h2></div>
          <Link to="/coleccion" className="editorial-link inline-flex items-center gap-3">Explorar productos <ArrowUpRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </main><Footer /></div>;
}

export function CopySection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className="editorial-copy grid md:grid-cols-[80px_1fr] gap-4 md:gap-8 border-t border-current/20 pt-7 pb-10"><span className="technical-label">{number}</span><div><h2 className="text-xl md:text-2xl font-semibold mb-4">{title}</h2><div className="space-y-4 leading-relaxed">{children}</div></div></section>;
}
