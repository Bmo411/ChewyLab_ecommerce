import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve('dist');
const manifest = JSON.parse(await readFile(resolve(dist, 'seo-manifest.json'), 'utf8'));
const readPage = path => readFile(resolve(dist, `.${path}`, 'index.html'), 'utf8');
const script = (html, id) => JSON.parse(html.match(new RegExp(`<script id="${id}"[^>]*>([\\s\\S]*?)<\\/script>`))[1]);

test('cada página pública entrega contenido real, canonical único y metadatos al descargar HTML', async () => {
  for (const path of manifest.paths) {
    const html = await readPage(path);
    assert.match(html, /<h1[\s>]/);
    assert.doesNotMatch(html, /<div id="root"><\/div>/);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(html.includes(`href="${manifest.site}${path}"`));
    assert.match(html, /<meta property="og:title"/);
    assert.match(html, /<meta property="og:image"/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
    assert.match(html, /<meta name="robots" content="index, follow/);
    assert.doesNotMatch(html, /sk_live_|sb_secret_|SUPABASE_SERVICE_ROLE_KEY/);
    if (path.startsWith('/producto/')) {
      const snapshot = script(html, 'chewylab-catalog');
      const product = snapshot.products.find(p => path.endsWith('/' + p.slug));
      const graph = script(html, 'chewylab-structured-data')['@graph'];
      const structured = graph.find(p => p['@type'] === 'Product');
      assert.equal(structured.name, product.name);
      assert.match(structured.url, /^https:\/\//);
      assert.ok(structured.image.length > 0);
      assert.ok(html.includes('Ingredientes'));
      assert.doesNotMatch(html, /Cargando producto/);
      assert.ok(graph.some(p => p['@type'] === 'BreadcrumbList'));
      const prices = product.product_variants.filter(v => v.active && Number(v.price) > 0).map(v => Number(v.price));
      if (prices.length) { assert.equal(structured.offers.priceCurrency, 'MXN'); assert.equal(Number(structured.offers.lowPrice), Math.min(...prices)); }
    }
  }
});
test('páginas transaccionales y 404 incluyen noindex en HTML sin ejecutar JavaScript', async () => {
  for (const path of ['/login','/register','/checkout','/pedido-exitoso']) {
    const html = await readPage(path);
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(html, /rel="canonical"/);
  }
  assert.match(await readFile(resolve(dist,'404.html'),'utf8'), /name="robots" content="noindex, nofollow"/);
});
test('sitemap sólo lista URLs públicas y robots permite rastreo del catálogo y recursos', async () => {
  const xml = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(urls, manifest.paths.map(path => manifest.site + path));
  assert.ok(urls.every(url => !/checkout|login|register|pedido-exitoso/.test(url)));
  const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
  assert.match(robots, /User-agent: \*\nAllow: \//);
  assert.ok(robots.includes(`Sitemap: ${manifest.site}/sitemap.xml`));
  assert.doesNotMatch(robots, /Disallow: \/(?:producto|assets|coleccion|checkout|login)/);
  const llms = await readFile(resolve(dist, 'llms.txt'), 'utf8');
  for (const path of manifest.productPaths) assert.ok(llms.includes(manifest.site + path));
});
