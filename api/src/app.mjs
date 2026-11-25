import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { HttpError, commerceStatus, parseCheckout, processStripeEvent, rpc, stripeParams } from './checkout.mjs';

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function createApp({ env, database, stripe, staticDir = null, logger = console }) {
  const app = express();
  const webUrl = (env.WEB_URL || 'http://localhost:6900').replace(/\/$/, '');
  const origin = new URL(webUrl);
  if (origin.pathname !== '/' || origin.search || origin.hash || (env.NODE_ENV === 'production' && origin.protocol !== 'https:')) throw new Error('WEB_URL debe ser un origen HTTPS sin rutas.');
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    if (env.SEARCH_INDEXING_ENABLED === 'false' || /^\/(?:api|webhooks|health|login|register|checkout|pedido-exitoso)(?:\/|$)/.test(req.path) || req.path === '/seo-manifest.json') res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
  // Un único proxy de confianza: Coolify/Traefik o Render, directamente frente a Node.
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
  const supabaseOrigin = env.SUPABASE_URL ? new URL(env.SUPABASE_URL).origin : null;
  app.use(helmet({ contentSecurityPolicy: { directives: {
    connectSrc: ["'self'", ...(supabaseOrigin ? [supabaseOrigin] : [])],
    imgSrc: ["'self'", 'data:', 'https:'],
  } } }));
  app.use(cors({ origin: webUrl, allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  // El catálogo puede publicarse antes de configurar pagos. /health conserva
  // la comprobación de base/migración; Docker sólo comprueba que el proceso viva.
  app.get('/health/live', (_req, res) => res.set('Cache-Control', 'no-store').json({ ok: true }));

  app.get('/health', asyncRoute(async (_req, res) => {
    let schema = false;
    if (database) {
      const { data, error } = await database.rpc('chewy_checkout_ready');
      schema = !error && data === true;
    }
    res.status(schema ? 200 : 503).json({ ok: schema, database: Boolean(database), schema, stripe: Boolean(stripe), webhook: Boolean(env.STRIPE_WEBHOOK_SECRET) });
  }));
  app.get('/api/commerce-status', (_req, res) => res.json(commerceStatus(env, database, stripe)));

  // La firma exige el cuerpo crudo. Esta ruta debe preceder a express.json().
  app.post('/webhooks/stripe', express.raw({ type: 'application/json', limit: '256kb' }), asyncRoute(async (req, res) => {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET || !database) throw new HttpError(503, 'Webhook pendiente de configuración.');
    let event;
    try { event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET); }
    catch { throw new HttpError(400, 'Firma Stripe inválida.'); }
    await processStripeEvent(database, event);
    res.json({ received: true });
  }));
  app.use(express.json({ limit: '32kb' }));
  const authenticate = asyncRoute(async (req, _res, next) => {
    if (!database) throw new HttpError(503, 'Base de datos pendiente de configuración.');
    const token = req.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) throw new HttpError(401, 'Inicia sesión para continuar.');
    const { data, error } = await database.auth.getUser(token);
    if (error || !data.user) throw new HttpError(401, 'Tu sesión venció. Vuelve a iniciar sesión.');
    req.user = data.user;
    next();
  });
  const checkoutLimit = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Demasiados intentos. Espera un minuto.' } });
  app.post('/api/checkout/create-session', checkoutLimit, authenticate, asyncRoute(async (req, res) => {
    if (!commerceStatus(env, database, stripe).checkoutEnabled) throw new HttpError(503, 'Las compras aún no están habilitadas.');
    const input = parseCheckout(req.body);
    const reservation = await rpc(database, 'chewy_reserve_checkout', {
      p_user_id: req.user.id, p_request_id: input.requestId,
      p_items: input.items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })),
      p_shipping_cents: Number(env.SHIPPING_AMOUNT_CENTS),
    });
    if (reservation.status !== 'reserved') throw new HttpError(409, 'Esta compra ya terminó. Actualiza el carrito.');
    if (reservation.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(reservation.stripe_session_id);
      if (session.status !== 'open' || !session.url) throw new HttpError(409, 'La sesión de pago terminó. Actualiza el carrito.');
      return res.json({ url: session.url });
    }
    // Reserva persistente e idempotencia Stripe: una caída o timeout conserva el mismo intento.
    // Nunca liberar stock por un error de red: Stripe pudo haber creado la sesión.
    if (new Date(reservation.expires_at).getTime() < Date.now() + 30 * 60_000) {
      throw new HttpError(409, 'El intento debe conciliarse antes de reintentar. Contacta a la tienda.');
    }
    const session = await stripe.checkout.sessions.create(stripeParams(reservation, webUrl, req.user.email), { idempotencyKey: `chewylab/${reservation.id}` });
    await rpc(database, 'chewy_attach_session', { p_reservation_id: reservation.id, p_session_id: session.id });
    if (!session.url) throw new HttpError(503, 'No se pudo abrir Stripe. Reintenta con el mismo carrito.');
    res.json({ url: session.url });
  }));

  app.get('/api/orders/session/:sessionId', rateLimit({ windowMs: 60_000, limit: 120 }), authenticate, asyncRoute(async (req, res) => {
    if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(req.params.sessionId)) throw new HttpError(400, 'Sesión de pago inválida.');
    const { data, error } = await database.from('chewy_orders')
      .select('id,status,amount_total,currency,created_at,items')
      .eq('stripe_session_id', req.params.sessionId).eq('user_id', req.user.id).maybeSingle();
    if (error) throw new HttpError(503, 'No se pudo consultar el pedido.');
    if (!data) return res.status(202).json({ status: 'pending' });
    res.json(data);
  }));
  if (staticDir) {
    const manifestFile = resolve(staticDir, 'seo-manifest.json');
    const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : null;
    const publicPaths = manifest ? new Set(manifest.pagePaths || manifest.paths) : null;
    const noindexPaths = new Set(manifest?.noindexPaths || []);
    app.use((req, res, next) => {
      if (noindexPaths.has(req.path.replace(/\/+$/, ''))) res.set('X-Robots-Tag', 'noindex, nofollow');
      next();
    });
    app.get('/robots.txt', (_req, res, next) => {
      if (env.SEARCH_INDEXING_ENABLED !== 'false') return next();
      res.type('text/plain').set('Cache-Control', 'no-cache').send('User-agent: *\nDisallow: /\n');
    });
    app.get(/\.html$/, (req, res, next) => {
      if (req.path === '/404.html' || req.path === '/spa.html') return res.status(404).set('X-Robots-Tag', 'noindex, nofollow').sendFile(resolve(staticDir, '404.html'));
      const path = req.path.replace(/\/index\.html$/, '') || '/';
      if (publicPaths?.has(path)) return res.redirect(308, path);
      res.set('X-Robots-Tag', 'noindex, nofollow');
      next();
    });
    app.use(express.static(staticDir, {
      index: false,
      redirect: false,
      dotfiles: 'deny',
      setHeaders(res, file) {
        const immutable = /[\\/]assets[\\/]/.test(file);
        res.set('Cache-Control', immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
      },
    }));
    const spaRoute = /^\/(?:$|coleccion\/?$|producto\/[^/]+\/?$|login\/?$|register\/?$|checkout\/?$|pedido-exitoso\/?$)/;
    app.get('*', (req, res, next) => {
      // Una ruta API o un recurso faltante nunca debe recibir HTML de la SPA.
      if (/^\/(?:api|webhooks|health|assets)(?:\/|$)/.test(req.path) || /\.[^/]+$/.test(req.path)) return next();
      const path = req.path.replace(/\/+$/, '') || '/';
      const privatePath = ['/login', '/register', '/checkout', '/pedido-exitoso'].includes(path);
      const publicPath = publicPaths ? publicPaths.has(path) : spaRoute.test(path);
      if (publicPath && req.path !== path) return res.redirect(308, path + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
      const page = path === '/' ? resolve(staticDir, 'index.html') : resolve(staticDir, `.${path}`, 'index.html');
      const found = publicPath || privatePath;
      res.set('Cache-Control', privatePath ? 'no-store' : 'no-cache');
      if (!found) res.set('X-Robots-Tag', 'noindex, nofollow');
      const fallback = resolve(staticDir, existsSync(resolve(staticDir, '404.html')) ? '404.html' : 'index.html');
      res.status(found ? 200 : 404).sendFile(found && existsSync(page) ? page : fallback);
    });
  }
  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
  app.use((error, _req, res, _next) => {
    // No registrar cuerpos, tokens, direcciones ni mensajes de terceros con información sensible.
    const status = error.status || 500;
    if (status >= 500) logger.error('API request failed', { status, type: error.type || error.name || 'Error' });
    res.status(status).json({ error: error instanceof HttpError ? error.message : status === 400 ? 'JSON inválido.' : 'No se pudo completar la operación. Reintenta más tarde.' });
  });
  return app;
}
