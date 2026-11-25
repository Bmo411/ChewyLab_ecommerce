import type { CatalogSnapshot } from './catalog';
import { toProduct } from './catalog';
import { editorialPages, brand } from './editorial';

export const DEFAULT_SITE_URL = 'https://chewylab.blueberrieslab.com';
export const cleanText = (text: unknown) => String(text ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
export const productPath = (slug: string) => `/producto/${encodeURIComponent(slug)}`;
const absolute = (url: string, site: string) => {
  try { const result = new URL(url, site); return /^https?:$/.test(result.protocol) ? result.href : null; } catch { return null; }
};
export function resolveSeo(pathname: string, data: CatalogSnapshot | null, siteUrl = DEFAULT_SITE_URL) {
  const site = new URL(siteUrl).origin;
  const path = pathname.replace(/\/+$/, '') || '/';
  const row = data?.products.find(p => productPath(p.slug) === path);
  const isProduct = path.startsWith('/producto/');
  const editorial = editorialPages[path];
  const publicPage = path === '/' || path === '/coleccion' || Boolean(row) || Boolean(editorial && !editorial.review);
  const privatePage = ['/login', '/register', '/checkout', '/pedido-exitoso'].includes(path) || Boolean(editorial?.review);
  let title = 'Página no encontrada | ChewyLab';
  let description = 'La página solicitada no está disponible. Explora la colección de ChewyLab.';
  if (path === '/') { title = 'Chewy Lab | Gourmet Gummy Co. · Guadalajara'; description = 'Más que una gomita, o eso queremos que creas. Explora Chewy Lab: confitería de Guadalajara, diseño sobrio y perfiles de sabor con sentido del humor.'; }
  if (path === '/coleccion') { title = 'Colección de gomitas y presentaciones | ChewyLab'; description = 'Explora la colección de ChewyLab. Consulta mezclas, presentaciones, precios e ingredientes de nuestras gomitas.'; }
  if (row) { title = `${row.name} | Gomitas ChewyLab`; description = (cleanText(row.description || toProduct(row).details.long_description) || `Conoce ${row.name} de ChewyLab: presentaciones, ingredientes y disponibilidad.`).slice(0, 160); }
  if (privatePage && !editorial) { title = `${({ '/login': 'Iniciar sesión', '/register': 'Crear cuenta', '/checkout': 'Checkout', '/pedido-exitoso': 'Confirmación de pedido' } as Record<string, string>)[path]} | ChewyLab`; description = 'Acceso y gestión de tu compra en ChewyLab.'; }
  if (editorial) { title = `${editorial.title} | Chewy Lab`; description = editorial.description; }
  const image = row ? absolute(toProduct(row).images[0]?.image_url || '/social-card.jpg', site) : `${site}/social-card.jpg`;
  const canonical = publicPage ? `${site}${path === '/' ? '/' : path}` : null;
  const graph: Record<string, unknown>[] = [];
  if (publicPage) {
    graph.push({ '@type': 'Organization', '@id': `${site}/#organization`, name: brand.name, url: `${site}/`, logo: `${site}/brand-logo.png` });
    graph.push({ '@type': 'WebSite', '@id': `${site}/#website`, name: 'ChewyLab', url: `${site}/`, inLanguage: 'es-MX', publisher: { '@id': `${site}/#organization` } });
  }
  if (row) {
    const product = toProduct(row);
    const priced = product.variants.filter(v => Number.isFinite(v.price) && v.price > 0);
    graph.push({ '@type': 'Product', '@id': `${canonical}#product`, name: row.name, url: canonical, description: cleanText(product.details.long_description || row.description || description), image: product.images.map(i => absolute(i.image_url, site)).filter(Boolean), brand: { '@type': 'Brand', name: 'ChewyLab' }, category: product.category_name,
      ...(priced.length ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'MXN', lowPrice: Math.min(...priced.map(v => v.price)).toFixed(2), highPrice: Math.max(...priced.map(v => v.price)).toFixed(2), offerCount: priced.length, url: canonical } } : {}),
    });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: `${site}/` }, { '@type': 'ListItem', position: 2, name: 'Colección', item: `${site}/coleccion` }, { '@type': 'ListItem', position: 3, name: row.name, item: canonical }] });
  } else if (path === '/coleccion' && data) {
    graph.push({ '@type': 'CollectionPage', name: 'Colección ChewyLab', url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: data.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `${site}${productPath(p.slug)}` })) } });
  }
  if (editorial && publicPage) graph.push({ '@type': path === '/manifiesto' ? 'AboutPage' : path === '/contacto' ? 'ContactPage' : 'WebPage', name: editorial.title, description: editorial.description, url: canonical, inLanguage: 'es-MX', isPartOf: { '@id': `${site}/#website` } });
  return { title, description, canonical, image, robots: publicPage ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow', type: row ? 'product' : 'website', notFound: !publicPage && !privatePage, productMissing: isProduct && !row, structuredData: graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null };
}
