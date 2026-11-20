import { z } from 'zod';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const item = z.object({ variantId: z.string().min(1).max(100), quantity: z.number().int().min(1).max(99) }).strict();
const request = z.object({ requestId: z.string().uuid(), items: z.array(item).min(1).max(50) }).strict();

export function parseCheckout(body) {
  const result = request.safeParse(body);
  if (!result.success) throw new HttpError(400, 'Carrito inválido. Envía variantes y cantidades enteras entre 1 y 99.');
  const ids = result.data.items.map(i => i.variantId);
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'El carrito contiene variantes repetidas.');
  return result.data;
}

export function commerceStatus(env, database, stripe) {
  const blockers = [];
  if (!database) blockers.push('Supabase de servidor pendiente');
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) blockers.push('Stripe y webhook pendientes');
  if (!/^(0|[1-9]\d*)$/.test(env.SHIPPING_AMOUNT_CENTS ?? '') || !Number.isSafeInteger(Number(env.SHIPPING_AMOUNT_CENTS))) blockers.push('Tarifa de envío pendiente');
  if (env.COMMERCE_ENABLED !== 'true') blockers.push('Comercio desactivado');
  if (env.LEGAL_PUBLICATION_CONFIRMED !== 'true') blockers.push('Políticas públicas pendientes de revisión');
  return { checkoutEnabled: blockers.length === 0, blockers, currency: 'mxn', shippingAmountCents: blockers.some(b => b.startsWith('Tarifa')) ? null : Number(env.SHIPPING_AMOUNT_CENTS) };
}

export async function rpc(database, name, args) {
  const { data, error } = await database.rpc(name, args);
  if (error) {
    if (error.code === 'P0001') throw new HttpError(409, error.message);
    throw new HttpError(503, 'No se pudo procesar el pedido. Inténtalo nuevamente con el mismo carrito.');
  }
  return data;
}

export function stripeParams(reservation, webUrl, email) {
  return {
    mode: 'payment', locale: 'es', payment_method_types: ['card'],
    client_reference_id: reservation.id,
    customer_email: email,
    expires_at: Math.floor(new Date(reservation.expires_at).getTime() / 1000),
    success_url: `${webUrl}/pedido-exitoso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${webUrl}/checkout?cancelled=1`,
    shipping_address_collection: { allowed_countries: ['MX'] },
    phone_number_collection: { enabled: true },
    // Publicar términos y privacidad en el perfil de Stripe antes de activar.
    consent_collection: { terms_of_service: 'required' },
    shipping_options: [{ shipping_rate_data: { type: 'fixed_amount', display_name: 'Envío a México', fixed_amount: { amount: reservation.shipping_cents, currency: 'mxn' } } }],
    line_items: reservation.items.map(i => ({
      quantity: i.quantity,
      price_data: { currency: 'mxn', unit_amount: i.unit_amount, product_data: { name: `${i.name} · ${i.weight}`, metadata: { variant_id: i.variant_id } } },
    })),
    metadata: { source: 'chewylab', reservation_id: reservation.id },
  };
}

export async function processStripeEvent(database, event) {
  const session = event.data.object;
  if (session.metadata?.source !== 'chewylab') return;
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    if (session.payment_status !== 'paid') return;
    await rpc(database, 'chewy_complete_order', {
      p_reservation_id: session.metadata.reservation_id,
      p_session_id: session.id,
      p_amount_total: session.amount_total,
      p_currency: session.currency,
      p_checkout_data: {
        customer_details: session.customer_details,
        shipping_details: session.collected_information?.shipping_details ?? session.shipping_details ?? null,
        payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
        terms_accepted: session.consent?.terms_of_service === 'accepted',
        paid_at: new Date(event.created * 1000).toISOString(),
      },
    });
  }
  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    await rpc(database, 'chewy_release_reservation', { p_reservation_id: session.metadata.reservation_id, p_session_id: session.id });
  }
}
