import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import Stripe from 'stripe';
import { createApp } from '../src/app.mjs';
import { commerceStatus, parseCheckout, processStripeEvent, stripeParams } from '../src/checkout.mjs';

const userId = randomUUID();
const env = { WEB_URL: 'https://chewylab.blueberrieslab.com', COMMERCE_ENABLED: 'true', LEGAL_PUBLICATION_CONFIRMED: 'true', SHIPPING_AMOUNT_CENTS: '9900', STRIPE_WEBHOOK_SECRET: 'whsec_test_fixture' };
const reservation = { id: randomUUID(), status: 'reserved', expires_at: new Date(Date.now()+35*60_000).toISOString(), shipping_cents: 9900, items: [{variant_id:randomUUID(),quantity:2,unit_amount:25050,name:'Gomitas',weight:'1 kg'}] };
const input = () => ({requestId: randomUUID(), items: [{variantId:reservation.items[0].variant_id,quantity:2}]});

test('checkout acepta sólo variantes y cantidades, rechaza manipulación de precios', () => {
  assert.equal(parseCheckout(input()).items[0].quantity,2);
  for (const body of [null,{}, {...input(),amount:1}, {...input(),items:[]}, {...input(),items:[{variantId:'a',quantity:1,price:0}]}, {...input(),items:[{variantId:'a',quantity:0}]}, {...input(),items:[{variantId:'a',quantity:1.5}]}, {...input(),items:[{variantId:'a',quantity:100}]}, {...input(),items:[{variantId:'a',quantity:1},{variantId:'a',quantity:1}]}]) {
    assert.throws(()=>parseCheckout(body),{status:400});
  }
});
test('compuertas cerradas por defecto y tarifa gratuita requiere 0 explícito', () => {
  assert.equal(commerceStatus({},null,null).checkoutEnabled,false);
  assert.equal(commerceStatus(env,{},{}).checkoutEnabled,true);
  for(const value of ['',undefined,'-1','1.5','NaN','9007199254740992']) assert.equal(commerceStatus({...env,SHIPPING_AMOUNT_CENTS:value},{},{}).checkoutEnabled,false);
  assert.equal(commerceStatus({...env,SHIPPING_AMOUNT_CENTS:'0'},{},{}).checkoutEnabled,true);
});
test('Stripe usa snapshot del servidor, MXN, dirección MX y sólo tarjeta', () => {
  const params = stripeParams(reservation,env.WEB_URL,'buyer@example.invalid');
  assert.equal(params.line_items[0].price_data.unit_amount,25050);
  assert.equal(params.shipping_options[0].shipping_rate_data.fixed_amount.amount,9900);
  assert.deepEqual(params.payment_method_types,['card']);
  assert.deepEqual(params.shipping_address_collection.allowed_countries,['MX']);
  assert.equal(params.success_url,`${env.WEB_URL}/pedido-exitoso?session_id={CHECKOUT_SESSION_ID}`);
});
test('webhook ignora sesiones ajenas, pendientes y eventos no relacionados', async () => {
  const database = {rpc(){throw new Error('No debe procesar');}};
  await processStripeEvent(database,{type:'checkout.session.completed',data:{object:{metadata:{source:'uji-web'},payment_status:'paid'}}});
  await processStripeEvent(database,{type:'checkout.session.completed',data:{object:{metadata:{source:'chewylab'},payment_status:'unpaid'}}});
  await processStripeEvent(database,{type:'payment_intent.created',data:{object:{}}});
});

async function withServer(overrides, run) {
  const calls=[];
  const database = {rpc:async(name,args)=>{calls.push([name,args]);return {data:name==='chewy_checkout_ready'?true:reservation,error:null};},auth:{getUser:async token=>token==='valid'?{data:{user:{id:userId,email:'buyer@example.invalid'}},error:null}:{data:{user:null},error:true}}};
  const stripe = {checkout:{sessions:{create:async(params,options)=>{calls.push(['stripe-create',params,options]);return {id:'cs_test_example',url:'https://checkout.stripe.com/c/pay/test'};}}},webhooks:new Stripe('sk_test_fixture').webhooks};
  const server = createApp({env,database,stripe,logger:{error(){}},...overrides}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  try {await run({base:`http://127.0.0.1:${server.address().port}`,calls,database,stripe});}
  finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
const post = body=>({method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer valid'},body:JSON.stringify(body)});

test('API exige sesión válida antes de reservar', async()=>withServer({},async({base,calls})=>{
  for(const authorization of [undefined,'Bearer invalid']) {
    const options=post(input());delete options.headers.Authorization;if(authorization)options.headers.Authorization=authorization;
    assert.equal((await fetch(base+'/api/checkout/create-session',options)).status,401);
  }
  assert.equal(calls.length,0);
}));
test('API reserva desde identidad verificada y reintenta con clave Stripe estable',async()=>withServer({},async({base,calls})=>{
  const body=input();
  for(let i=0;i<2;i++) assert.equal((await fetch(base+'/api/checkout/create-session',post(body))).status,200);
  const reserves=calls.filter(c=>c[0]==='chewy_reserve_checkout');
  assert.equal(reserves[0][1].p_user_id,userId);
  assert.deepEqual(reserves[0][1].p_items,[{variant_id:body.items[0].variantId,quantity:2}]);
  const creates=calls.filter(c=>c[0]==='stripe-create');
  assert.equal(creates[0][2].idempotencyKey,creates[1][2].idempotencyKey);
  assert.equal(calls.filter(c=>c[0]==='chewy_attach_session').length,2);
}));
test('API preserva reserva cuando Stripe responde con timeout',async()=>withServer({stripe:{checkout:{sessions:{create:async()=>{throw new Error('timeout');}}}}},async({base,calls})=>{
  assert.equal((await fetch(base+'/api/checkout/create-session',post(input()))).status,500);
  assert.equal(calls.some(c=>c[0]==='chewy_release_reservation'),false);
}));
test('API cerrada devuelve 503 sin crear reservas',async()=>withServer({env:{...env,COMMERCE_ENABLED:'false'}},async({base,calls})=>{
  assert.equal((await fetch(base+'/api/checkout/create-session',post(input()))).status,503);
  assert.equal(calls.length,0);
}));
test('firma Stripe se verifica sobre bytes reales antes de JSON',async()=>withServer({},async({base,calls,stripe})=>{
  const payload=JSON.stringify({id:'evt_test_fixture',type:'checkout.session.completed',created:1700000000,data:{object:{id:'cs_test_example',payment_status:'paid',amount_total:60000,currency:'mxn',metadata:{source:'chewylab',reservation_id:reservation.id}}}});
  const header=stripe.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET});
  const options={method:'POST',headers:{'Content-Type':'application/json','Stripe-Signature':header},body:payload};
  assert.equal((await fetch(base+'/webhooks/stripe',options)).status,200);
  assert.equal(calls[0][0],'chewy_complete_order');
  assert.equal((await fetch(base+'/webhooks/stripe',{...options,body:payload+' '})).status,400);
  assert.equal(calls.length,1);
}));
test('API no expone pedidos de otros usuarios ni datos personales',async()=>withServer({},async({base,database})=>{
  const filters=[];
  database.from=name=>{assert.equal(name,'chewy_orders');const q={select(fields){assert.equal(fields.includes('checkout_data'),false);return q;},eq(key,value){filters.push([key,value]);return q;},async maybeSingle(){return{data:null,error:null};}};return q;};
  const r=await fetch(base+'/api/orders/session/cs_test_example',{headers:{Authorization:'Bearer valid'}});
  assert.equal(r.status,202);assert.deepEqual(filters,[['stripe_session_id','cs_test_example'],['user_id',userId]]);
}));
