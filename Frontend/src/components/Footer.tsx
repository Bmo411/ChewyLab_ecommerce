import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className="bg-card border-t border-border/30 py-14">
    <div className="container mx-auto px-6">
      <div className="grid gap-10 md:grid-cols-3 mb-10">
        <div><Link to="/" className="font-display text-2xl text-gradient-gold font-semibold">ChewyLab</Link><p className="mt-4 text-sm text-muted-foreground">Gomitas y mezclas de sabor. Consulta presentaciones e ingredientes en cada producto.</p></div>
        <nav aria-label="Colección"><h2 className="font-display text-lg mb-4">Explora ChewyLab</h2><ul className="space-y-3 text-sm text-muted-foreground"><li><Link to="/coleccion" className="hover:text-gold">Ver colección</Link></li><li><a href="/#historia" className="hover:text-gold">Nuestra historia</a></li></ul></nav>
        <div><h2 className="font-display text-lg mb-4">Información de producto</h2><p className="text-sm text-muted-foreground">Las fichas de la colección incluyen ingredientes, conservación y presentaciones disponibles.</p></div>
      </div>
      <p className="border-t border-border/30 pt-6 text-xs text-muted-foreground">© {new Date().getFullYear()} ChewyLab. Todos los derechos reservados.</p>
    </div>
  </footer>;
}
