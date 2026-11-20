import { test, expect } from '@playwright/test';

test('los metadatos siguen al producto al navegar y no se acumulan canonicals', async ({ page }) => {
  const product = { id: 'fixture-product', name: 'Gomitas de prueba', slug: 'gomitas-prueba', active: true, description: 'Descripción de gomitas.', created_at: '2026-01-01', categories: { name: 'Spicy Lab' }, product_variants: [{ id: 'fixture-variant', weight: '1 kg', active: true, price: 250.5, stock: 5, sku: 'FIXTURE' }], product_images: [{ id: 'fixture-image', image_url: '/favicon.svg', is_main: true, position: 0 }], product_details: { long_description: 'Descripción de gomitas de prueba.', ingredients: 'Azúcar', storage_info: 'Lugar seco', usage_info: null, nutrition_info: null } };
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/products')) return route.fulfill({ json: url.searchParams.get('slug') === 'eq.no-existe' ? [] : [product] });
    if (url.pathname.endsWith('/categories')) return route.fulfill({ json: [{ id: 'cat', name: 'Spicy Lab' }] });
    return route.fulfill({ json: [] });
  });
  await page.goto('/coleccion?categoria=Spicy%20Lab');
  await expect(page).toHaveTitle('Colección de gomitas y presentaciones | ChewyLab');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://chewylab.blueberrieslab.com/coleccion');
  await page.locator('article a').first().click();
  await expect(page).toHaveTitle('Gomitas de prueba | Gomitas ChewyLab');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Gomitas de prueba | Gomitas ChewyLab');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index, follow/);
  const schema = await page.locator('#chewylab-structured-data').textContent();
  expect(JSON.parse(schema || '{}')['@graph'].some((entry: { '@type': string }) => entry['@type'] === 'Product')).toBe(true);
  await page.goBack();
  await expect(page).toHaveTitle('Colección de gomitas y presentaciones | ChewyLab');
  await page.goto('/producto/no-existe');
  await expect(page.getByRole('heading', { name: 'Producto no encontrado' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});
