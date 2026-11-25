import { Link } from 'react-router-dom';
import { brand, contact } from '@/lib/editorial';
import { GoldText } from './GoldText';

const columns = [
  { title: 'El laboratorio', links: [['Colección','/coleccion'],['Laboratorios','/laboratorios'],['Manifiesto','/manifiesto'],['Ingredientes','/ingredientes']] },
  { title: 'Atención', links: [['Preguntas frecuentes','/preguntas-frecuentes'],['Envíos','/envios'],['Contacto','/contacto'],['Incidencias','/devoluciones']] },
  { title: 'Información', links: [['Privacidad','/privacidad'],['Condiciones de compra','/terminos'],['Cookies y almacenamiento','/cookies']] },
];
export default function Footer() {
  return <footer className="bg-background border-t border-border py-14 md:py-20"><div className="container mx-auto px-6">
    <div className="grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-16"><div><Link to="/" className="font-display font-semibold text-3xl tracking-wide"><GoldText>{brand.name}</GoldText></Link><p className="brand-kicker mt-3 mb-6">{brand.descriptor}</p><p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{brand.motto}</p><p className="technical-label text-gold mt-7">GUADALAJARA / MX</p>{contact.email && <a href={`mailto:${contact.email}`} className="block text-xs text-muted-foreground hover:text-foreground break-all mt-5">{contact.email}</a>}</div>{columns.map(column=><nav key={column.title} aria-label={column.title}><h2 className="brand-kicker mb-6">{column.title}</h2><ul className="space-y-4 text-sm text-muted-foreground">{column.links.map(([label,path])=><li key={path}><Link to={path} className="hover:text-foreground transition-colors">{label}</Link></li>)}</ul></nav>)}</div>
    <div className="border-t border-border pt-6 flex flex-col md:flex-row gap-3 justify-between text-xs text-muted-foreground"><p>© {new Date().getFullYear()} {brand.name}.</p><p className="technical-label">EL DISEÑO SE TOMA EN SERIO. NOSOTROS, CON MEDIDA.</p></div>
  </div></footer>;
}
