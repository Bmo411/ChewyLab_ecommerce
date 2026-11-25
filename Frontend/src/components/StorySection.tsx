import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import logo from '@/assets/ChewyLablogoSinFondo.png';

export default function StorySection() {
  return <section id="historia" className="editorial-paper py-20 md:py-28"><div className="container mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-24 items-center">
    <div><p className="brand-kicker mb-7">01 / El manifiesto</p><h2 className="font-bold text-3xl md:text-5xl tracking-tight leading-tight mb-7">El empaque es serio.<br />El resto, con reservas.</h2><div className="space-y-5 editorial-copy"><p>Una gomita no necesita parecer una pieza de museo. Precisamente por eso decidimos hacerlo.</p><p>Chewy Lab combina una presentación sobria con una voz que reconoce lo evidente: estamos hablando de dulces. El humor vive en el contraste; el cuidado, en el producto.</p><p>Textura, acidez y picor merecen atención. La pretensión merece, de vez en cuando, una sonrisa.</p></div><Link to="/manifiesto" className="editorial-link mt-8">Conoce la marca <ArrowUpRight className="w-4 h-4" /></Link></div>
    <div className="bg-[#121212] text-[#FAF8F5] aspect-square p-8 md:p-12 flex flex-col items-center justify-center border border-[#2B2B28]"><img src={logo} alt="Isotipo hexagonal de Chewy Lab" className="w-48 md:w-64 aspect-square object-contain" loading="lazy" /><p className="text-2xl md:text-3xl font-bold tracking-[-0.01em]">Chewy Lab</p><p className="brand-kicker mt-3">Gourmet Gummy Co.</p><span className="technical-label text-[#D4AF37] mt-12">GUADALAJARA / MÉXICO</span></div>
  </div></section>;
}
