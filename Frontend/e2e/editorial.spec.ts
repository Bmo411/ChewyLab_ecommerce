import { test, expect, Page } from '@playwright/test';

async function catalog(page: Page) {
  const value = { value: 4, unit: 'g' };
  const product = { id: 'brand-product', name: 'Gomita experimental', slug: 'gomita-experimental', description: 'Ficha de prueba.', active: true, created_at: '2026-01-01', categories: { name: 'Chile\n' }, product_variants: [{ id: 'brand-variant', weight: 500, price: 200, active: true, stock: 3, sku: 'TEST' }], product_images: [{ id: 'brand-image', image_url: '/favicon.svg', is_main: true, position: 0 }], product_details: { long_description: 'Descripción del producto de prueba.', ingredients: 'Azúcar', nutrition_info: { calories: 320, protein: value, total_carbohydrates: value, sugars: value, total_fat: value, sodium: { value: 10, unit: 'mg' } }, storage_info: 'Conservar cerrado.', usage_info: 'Compartir.' } };
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    return route.fulfill({ json: url.pathname.endsWith('/products') ? [product] : url.pathname.endsWith('/categories') ? [{ id: 'cat', name: 'Chile\n' }] : [] });
  });
}

test('las páginas informativas abren y mantienen lectura sin desbordamiento', async ({ page }) => {
  await catalog(page);
  for (const path of ['/manifiesto','/laboratorios','/ingredientes','/preguntas-frecuentes','/envios','/contacto','/cookies','/privacidad','/terminos','/devoluciones']) {
    await page.goto(path);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (['/privacidad','/terminos','/devoluciones'].includes(path)) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');
      await expect(page.getByRole('note')).toContainText('Información preliminar');
    } else await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://chewylab.blueberrieslab.com${path}`);
  }
});

test('el perfil de laboratorio filtra categorías reales aunque tengan espacios', async ({ page }) => {
  await catalog(page);
  await page.goto('/laboratorios');
  await page.getByRole('link',{name:'Ver este perfil'}).first().click();
  await expect(page).toHaveURL(/\/coleccion\?categoria=Chile$/);
  await expect(page.getByRole('heading',{name:'Gomita experimental'})).toBeVisible();
});

test('preguntas y tabla nutrimental se pueden desplegar', async ({ page }) => {
  await catalog(page);
  await page.goto('/preguntas-frecuentes');
  const question=page.locator('details').filter({hasText:'¿Necesito una cuenta para comprar?'});
  await question.locator('summary').click();
  await expect(question.locator('p')).toBeVisible();
  await page.goto('/producto/gomita-experimental');
  await expect(page.getByRole('button',{name:'500 g',exact:true})).toBeVisible();
  await expect(page.getByText('320 kcal',{exact:true})).not.toBeVisible();
  await page.locator('summary').filter({hasText:'Información nutrimental'}).click();
  await expect(page.getByText('320 kcal',{exact:true})).toBeVisible();
});

test('contacto abre canales reales y el menú móvil permite llegar a la página', async ({ page }) => {
  await catalog(page);
  await page.goto('/manifiesto');
  if((page.viewportSize()?.width || 0)<1024) await page.getByRole('button',{name:'Abrir menú',exact:true}).click();
  await page.locator('header').getByRole('link',{name:'Contacto',exact:true}).filter({visible:true}).click();
  await expect(page).toHaveURL(/\/contacto$/);
  await expect(page.locator('main a[href="mailto:oceguedaalejandro12@gmail.com"]')).toBeVisible();
  await expect(page.locator('main a[href="https://wa.me/523112048692"]')).toBeVisible();
});
