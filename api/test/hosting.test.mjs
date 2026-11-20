import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { createApp } from '../src/app.mjs';

test('Coolify sirve SPA y API en un origen sin exigir Stripe para el catálogo', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'chewylab-hosting-'));
  let server;
  try {
    await mkdir(join(directory, 'assets'));
    await writeFile(join(directory, 'index.html'), '<!doctype html><html><body>ChewyLab</body></html>');
    await writeFile(join(directory, 'assets', 'app-hash.js'), 'console.log("fixture")');
    server = createApp({ env: { NODE_ENV: 'production', WEB_URL: 'https://chewylab.blueberrieslab.com', SUPABASE_URL: 'https://test-project.supabase.co' }, database: null, stripe: null, staticDir: directory }).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const path of ['/', '/coleccion', '/producto/gomitas', '/checkout', '/login', '/pedido-exitoso?session_id=cs_test_example']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 200, path);
      assert.match(await response.text(), /ChewyLab/);
      assert.equal(response.headers.get('cache-control'), /^\/(login|checkout|pedido-exitoso)/.test(path) ? 'no-store' : 'no-cache');
      assert.match(response.headers.get('content-security-policy'), /connect-src 'self' https:\/\/test-project\.supabase\.co/);
      assert.match(response.headers.get('content-security-policy'), /img-src 'self' data: https:/);
    }
    const live = await fetch(base + '/health/live');
    assert.equal(live.status, 200);
    assert.deepEqual(await live.json(), { ok: true });
    assert.equal((await fetch(base + '/health')).status, 503);
    const commerce = await fetch(base + '/api/commerce-status');
    assert.equal((await commerce.json()).checkoutEnabled, false);
    for (const path of ['/api/missing', '/webhooks/missing', '/health/missing', '/assets/missing.js', '/missing.js']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 404, path);
      assert.match(response.headers.get('content-type'), /application\/json/);
    }
    const unknown = await fetch(base + '/ruta-inexistente');
    assert.equal(unknown.status, 404);
    assert.match(await unknown.text(), /ChewyLab/);
    const asset = await fetch(base + '/assets/app-hash.js');
    assert.equal(asset.status, 200);
    assert.equal(asset.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  } finally {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    if (dirname(resolve(directory)) !== resolve(tmpdir()) || !basename(directory).startsWith('chewylab-hosting-')) throw new Error('Ruta temporal inesperada.');
    await rm(directory, { recursive: true, force: true });
  }
});

test('hosting prerenderizado conserva el HTML por ruta, 404 reales y noindex en privado/previews', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'chewylab-hosting-'));
  let server;
  try {
    for (const path of ['coleccion','producto/gomitas','checkout']) {
      await mkdir(join(directory,path),{recursive:true});
      await writeFile(join(directory,path,'index.html'),`<h1>${path}</h1>`);
    }
    await writeFile(join(directory,'index.html'),'<h1>Inicio</h1>');
    await writeFile(join(directory,'404.html'),'<h1>No encontrado</h1>');
    await writeFile(join(directory,'seo-manifest.json'),JSON.stringify({paths:['/','/coleccion','/producto/gomitas']}));
    const env = { NODE_ENV: 'production', WEB_URL: 'https://chewylab.blueberrieslab.com' };
    server = createApp({env,database:null,stripe:null,staticDir:directory}).listen(0,'127.0.0.1');
    await new Promise(resolve=>server.once('listening',resolve));
    const base=`http://127.0.0.1:${server.address().port}`;
    for(const path of ['/coleccion','/producto/gomitas']) {
      const response=await fetch(base+path,{headers:{'User-Agent':'OAI-SearchBot'}});
      assert.equal(response.status,200);
      assert.equal(await response.text(),`<h1>${path.slice(1)}</h1>`);
    }
    for(const path of ['/producto/no-existe','/coleccion/otra','/404.html']) {
      const response=await fetch(base+path);
      assert.equal(response.status,404);
      assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
    }
    const slash=await fetch(base+'/coleccion/?utm_source=test',{redirect:'manual'});
    assert.equal(slash.status,308);assert.equal(slash.headers.get('location'),'/coleccion?utm_source=test');
    const direct=await fetch(base+'/coleccion/index.html',{redirect:'manual'});
    assert.equal(direct.status,308);assert.equal(direct.headers.get('location'),'/coleccion');
    const checkout=await fetch(base+'/checkout');
    assert.equal(checkout.headers.get('x-robots-tag'),'noindex, nofollow');
    assert.equal(checkout.headers.get('cache-control'),'no-store');
    env.SEARCH_INDEXING_ENABLED='false';
    const robots=await fetch(base+'/robots.txt');assert.match(await robots.text(),/Disallow: \//);
    assert.equal((await fetch(base+'/')).headers.get('x-robots-tag'),'noindex, nofollow');
  } finally {
    if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
    if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith('chewylab-hosting-'))throw new Error('Ruta temporal inesperada.');
    await rm(directory,{recursive:true,force:true});
  }
});
