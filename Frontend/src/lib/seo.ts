import type { CatalogSnapshot } from './catalog';
import { toProduct } from './catalog';

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
  const publicPage = path === '/' || path === '/coleccion' || Boolean(row);
  const privatePage = ['/login', '/register', '/checkout', '/pedido-exitoso'].includes(path);
  let title = 'Página no encontrada | ChewyLab';
  let description = 'La página solicitada no está disponible. Explora la colección de ChewyLab.';
  if (path === '/') { title = 'ChewyLab | Gomitas artesanales y mezclas de sabor'; description = 'Descubre ChewyLab: gomitas en mezclas ácidas, picantes y botánicas. Explora presentaciones, ingredientes y precios en nuestra colección.'; }
  if (path === '/coleccion') { title = 'Colección de gomitas y presentaciones | ChewyLab'; description = 'Explora la colección de ChewyLab. Consulta mezclas, presentaciones, precios e ingredientes de nuestras gomitas.'; }
  if (row) { title = `${row.name} | Gomitas ChewyLab`; description = (cleanText(row.description || toProduct(row).details.long_description) || `Conoce ${row.name} de ChewyLab: presentaciones, ingredientes y disponibilidad.`).slice(0, 160); }
  if (privatePage) { title = `${({ '/login': 'Iniciar sesión', '/register': 'Crear cuenta', '/checkout': 'Checkout', '/pedido-exitoso': 'Confirmación de pedido' } as Record<string, string>)[path]} | ChewyLab`; description = 'Acceso y gestión de tu compra en ChewyLab.'; }
  const image = row ? absolute(toProduct(row).images[0]?.image_url || '/social-card.jpg', site) : `${site}/social-card.jpg`;
  const canonical = publicPage ? `${site}${path === '/' ? '/' : path}` : null;
  const graph: Record<string, unknown>[] = [];
  if (publicPage) {
    graph.push({ '@type': 'Organization', '@id': `${site}/#organization`, name: 'ChewyLab', url: `${site}/`, logo: `${site}/brand-logo.png` });
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
  return { title, description, canonical, image, robots: publicPage ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow', type: row ? 'product' : 'website', notFound: !publicPage && !privatePage, productMissing: isProduct && !row, structuredData: graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null };
}
