import { test, expect, Page } from '@playwright/test';

const userId = '00000000-0000-4000-8000-000000000001';
const variantId = '00000000-0000-4000-8000-000000000002';
const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'buyer@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };

async function fixtures(page: Page, enabled = true, hasUser = true) {
  if (hasUser) await page.addInitScript(({ user }) => {
    const expiry = Math.floor(Date.now() / 1000) + 3600;
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiry, role: 'authenticated' }))}.test`;
    localStorage.setItem('sb-chewylab-test-auth-token', JSON.stringify({ access_token: token, refresh_token: 'test', expires_at: expiry, expires_in: 3600, token_type: 'bearer', user }));
  }, { user });
  await page.route('**/auth/v1/user', route => route.fulfill({ json: user }));
  await page.route('**/rest/v1/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/carts')) return route.fulfill({ json: [{ id: 'cart-test' }] });
    if (path.endsWith('/cart_items')) return route.fulfill({ json: [{ id: 'cart-line-test', variant_id: variantId, quantity: 2, product_variants: { id: variantId, weight: '1 kg', price: 250.5, stock: 5, products: { id: 'product-test', name: 'Gomitas Spicy', product_images: [] } } }] });
    if (path.endsWith('/product_variants')) return route.fulfill({ json: [{ id: variantId, price: 250.5, stock: 5, active: true, products: { slug: 'gomitas-spicy', active: true } }] });
    return route.fulfill({ json: [] });
  });
  await page.route('**/api/commerce-status', route => route.fulfill({ json: { checkoutEnabled: enabled, blockers: enabled ? [] : ['Pendiente'], shippingAmountCents: 9900, currency: 'mxn' } }));
}

test('checkout muestra subtotal, envío y total; abre Stripe con variantes y cantidades', async ({ page }) => {
  await fixtures(page);
  let payload: { requestId: string; items: { variantId: string; quantity: number }[] } | undefined;
  await page.route('**/api/checkout/create-session', async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({ json: { url: 'https://checkout.stripe.com/c/pay/test' } });
  });
  await page.route('https://checkout.stripe.com/**', route => route.fulfill({ body: '<h1>Stripe test fixture</h1>', contentType: 'text/html' }));
  await page.goto('/checkout');
  await expect(page.getByText('$600.00 MXN', { exact: true })).toBeVisible();
  const button = page.getByRole('button', { name: 'Pagar con Stripe' });
  await expect(button).toBeEnabled();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await button.click();
  await expect(page).toHaveURL('https://checkout.stripe.com/c/pay/test');
  expect(payload?.items).toEqual([{ variantId, quantity: 2 }]);
  expect(payload?.requestId).toMatch(/^[0-9a-f-]{36}$/);
  expect(Object.keys(payload ?? {}).sort()).toEqual(['items', 'requestId']);
});

test('un timeout conserva carrito e intento para reintentar', async ({ page }) => {
  await fixtures(page);
  const ids: string[] = [];
  await page.route('**/api/checkout/create-session', async route => {
    ids.push(route.request().postDataJSON().requestId);
    await route.fulfill({ status: 503, json: { error: 'Reintenta con el mismo carrito.' } });
  });
  await page.goto('/checkout');
  const button = page.getByRole('button', { name: 'Pagar con Stripe' });
  await button.click();
  await expect(page.getByText('No se pudo iniciar el pago', { exact: true })).toBeVisible();
  await expect(button).toBeEnabled();
  await button.click();
  await expect.poll(() => ids.length).toBe(2);
  expect(ids[0]).toBe(ids[1]);
  await expect(page.getByText('Gomitas Spicy', { exact: true })).toBeVisible();
});

test('compuerta cerrada impide pagar y mantiene visible el carrito', async ({ page }) => {
  await fixtures(page, false);
  await page.goto('/checkout');
  await expect(page.getByRole('button', { name: 'Pagar con Stripe' })).toBeDisabled();
  await expect(page.getByText('La tienda aún está preparando las compras en línea.')).toBeVisible();
});

test('sin sesión vuelve a login y conserva destino de checkout', async ({ page }) => {
  await fixtures(page, true, false);
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcheckout$/);
});

test('retorno espera webhook antes de mostrar confirmación y folio', async ({ page }) => {
  await fixtures(page);
  let polls = 0;
  await page.route('**/api/orders/session/cs_test_example', route => {
    polls++;
    return route.fulfill(polls === 1 ? { status: 202, json: { status: 'pending' } } : { json: { id: 'order-test', status: 'paid', amount_total: 60000, currency: 'mxn', items: [{ variant_id: variantId, name: 'Gomitas Spicy', weight: '1 kg', quantity: 2, unit_amount: 25050 }] } });
  });
  await page.goto('/pedido-exitoso?session_id=cs_test_example');
  await expect(page.getByRole('heading', { name: 'Confirmación de tu pedido' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '¡Tu pedido está confirmado!' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Folio: order-test')).toBeVisible();
});
