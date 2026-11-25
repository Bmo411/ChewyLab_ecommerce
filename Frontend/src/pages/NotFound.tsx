import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function NotFound() { return <div className="min-h-screen bg-background"><Header/><main id="contenido" className="container mx-auto px-6 pt-40 pb-28"><p className="technical-label text-gold mb-8">ERROR / 404</p><h1 className="max-w-3xl text-4xl md:text-6xl font-bold leading-tight mb-7">Este experimento<br/>no produjo resultados.</h1><p className="max-w-xl text-muted-foreground mb-9 leading-relaxed">La página que buscas no existe o cambió de lugar. La colección, afortunadamente, sigue aquí.</p><Link to="/coleccion" className="editorial-link">Volver a la colección →</Link></main><Footer/></div>; }
