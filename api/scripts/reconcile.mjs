// Recuperar webhooks perdidos sin liberar reservas basándose únicamente en el reloj.
import 'dotenv/config';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { processStripeEvent, rpc } from '../src/checkout.mjs';

if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Falta configurar Stripe/Supabase de servidor.');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{ auth: { persistSession: false } });
const { data, error } = await db.from('chewy_checkout_reservations').select('id,stripe_session_id,expires_at').eq('status','reserved').lt('expires_at',new Date().toISOString()).order('created_at').limit(100);
if (error) throw new Error('No se pudieron consultar reservas.');
for (const r of data) {
  // Sesiones desconocidas: buscar metadata en Stripe antes de liberar.
  // Si no existe sesión local, un timeout pudo ocurrir después de crearla.
  let session = r.stripe_session_id ? await stripe.checkout.sessions.retrieve(r.stripe_session_id) : null;
  if (!session) {
    // Recorrer sesiones creadas en torno a la reserva; no usar búsquedas eventualmente consistentes.
    const since = Math.floor(new Date(r.expires_at).getTime()/1000)-36*60;
    for await (const candidate of stripe.checkout.sessions.list({ created: { gte: since, lte: since+36*60 }, limit: 100 })) {
      if (candidate.metadata?.source==='chewylab' && candidate.metadata?.reservation_id===r.id) { session=candidate; break; }
    }
    // Tras vencer expires_at ninguna creación con los parámetros originales es válida.
    if (!session) {
      await rpc(db,'chewy_release_reservation',{p_reservation_id:r.id,p_session_id:null});
      console.log('Reserva sin sesión liberada.');
      continue;
    }
    await rpc(db,'chewy_attach_session',{p_reservation_id:r.id,p_session_id:session.id});
  }
  if (session.status==='expired' || session.payment_status==='paid') {
    await processStripeEvent(db, { type:session.status==='expired'?'checkout.session.expired':'checkout.session.completed', created:Math.floor(Date.now()/1000), data:{object:session} });
    console.log('Reserva conciliada.');
  }
}
