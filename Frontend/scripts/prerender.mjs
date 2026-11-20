import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...loadEnv('production', root, ''), ...process.env };
const site = new URL(env.VITE_SITE_URL || 'https://chewylab.blueberrieslab.com').origin;
if (new URL(site).protocol !== 'https:') throw new Error('VITE_SITE_URL debe usar HTTPS.');
const url = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const key = env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Faltan las variables públicas de Supabase para generar HTML indexable.');
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const read = async (path) => {
  const response = await fetch(`${url}/rest/v1/${path}`, { headers, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`El catálogo público respondió HTTP ${response.status}. No se publicará un build SEO incompleto.`);
  return response.json();
};
const [products, categories] = await Promise.all([
  read('products?select=id,name,slug,description,active,created_at,categories(name),product_variants(*),product_images(*),product_details(*)&active=eq.true&order=slug.asc&limit=1000'),
  read('categories?select=id,name&order=name.asc&limit=1000'),
]);
// Nunca truncar silenciosamente el catálogo en un sitemap o snapshot.
if (products.length >= 1000 || categories.length >= 1000) throw new Error('El catálogo requiere paginación para prerenderizarse completo.');
const slugs = products.map(p => p.slug);
if (new Set(slugs).size !== slugs.length || slugs.some(s => typeof s !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(s))) throw new Error('Hay slugs duplicados o no válidos para las rutas.');
const data = { products, categories };
const { render, resolveSeo, productPath, cleanText } = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href);
const dist = join(root, 'dist');
const template = await readFile(join(dist, 'index.html'), 'utf8');
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const html = path => {
  const seo = resolveSeo(path, data, site);
  const metas = [['name','description',seo.description],['name','robots',seo.robots],['property','og:title',seo.title],['property','og:description',seo.description],['property','og:type',seo.type],['property','og:site_name','ChewyLab'],['property','og:locale','es_MX'],['name','twitter:card','summary_large_image'],['name','twitter:title',seo.title],['name','twitter:description',seo.description]];
  if (seo.image) metas.push(['property','og:image',seo.image],['name','twitter:image',seo.image]);
  if (seo.canonical) metas.push(['property','og:url',seo.canonical]);
  const extra = [
    ...metas.map(([attribute,key,value])=>`<meta ${attribute}="${key}" content="${escape(value)}" />`),
    ...(seo.canonical ? [`<link rel="canonical" href="${escape(seo.canonical)}" />`] : []),
    ...(seo.structuredData ? [`<script id="chewylab-structured-data" type="application/ld+json">${json(seo.structuredData)}</script>`] : []),
    `<script id="chewylab-catalog" type="application/json">${json(data)}</script>`,
  ].join('\n');
  return template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(seo.title)}</title>`).replace(/\s*<meta name="description"[^>]*>/, '').replace('</head>', `${extra}\n</head>`).replace('<div id="root"></div>', `<div id="root">${render(path, data)}</div>`);
};
const publicPaths = ['/', '/coleccion', ...products.map(p=>productPath(p.slug))];
const privatePaths = ['/login','/register','/checkout','/pedido-exitoso'];
for (const path of [...publicPaths,...privatePaths]) {
  const folder = path === '/' ? dist : join(dist, path);
  await mkdir(folder,{recursive:true});
  await writeFile(join(folder,'index.html'),html(path));
}
await writeFile(join(dist,'404.html'),html('/__not-found__'));
// El archivo base privado evita servir el SEO de inicio a rutas no existentes.
await writeFile(join(dist,'spa.html'),html('/__not-found__'));
await writeFile(join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map(p=>`<url><loc>${escape(site + p)}</loc></url>`).join('\n')}\n</urlset>\n`);
const robots = await readFile(join(root,'public','robots.txt'),'utf8');
await writeFile(join(dist,'robots.txt'),robots.replaceAll('https://chewylab.blueberrieslab.com',site));
await writeFile(join(dist,'llms.txt'),`# ChewyLab\n\n> Marca de gomitas y mezclas de sabor. Información pública del catálogo.\n\n## Sitio\n- [Inicio](${site}/)\n- [Colección](${site}/coleccion)\n- [Sitemap](${site}/sitemap.xml)\n\n## Productos\n${products.map(p=>`- [${cleanText(p.name).replaceAll('[','').replaceAll(']','')}](${site}${productPath(p.slug)}): ${cleanText(p.description).slice(0,200)}`).join('\n')}\n\nConsultar cada ficha para presentaciones, precios, ingredientes y disponibilidad actuales. Las condiciones de compra se muestran en la tienda; este archivo no confirma un pedido.\n`);
await copyFile(join(root,'src/assets/ChewyLablogoSinFondo.png'),join(dist,'brand-logo.png'));
await copyFile(join(root,'src/assets/hero.jpg'),join(dist,'social-card.jpg'));
await writeFile(join(dist,'seo-manifest.json'),JSON.stringify({site,paths:publicPaths,productPaths:products.map(p=>productPath(p.slug))}));
console.log(`[SEO] ${publicPaths.length} páginas públicas y ${privatePaths.length} privadas; sitemap y llms.txt generados con ${products.length} productos.`);
