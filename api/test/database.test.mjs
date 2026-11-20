import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

let db;
const buyer=randomUUID(),otherBuyer=randomUUID(),product=randomUUID(),variant=randomUUID();
before(async()=>{
  db=new PGlite();
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select null::uuid $$;");
  await db.exec(await readFile(new URL('../../supabase/catalog.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../../supabase/migrations/20261119_stripe_checkout.sql',import.meta.url),'utf8'));
});
after(async()=>{await db?.close();});
beforeEach(async()=>{
  await db.exec('truncate public.chewy_orders,public.chewy_checkout_reservations,public.cart_items,public.carts,public.product_details,public.product_images,public.product_variants,public.products,auth.users cascade;');
  await db.query('insert into auth.users values($1),($2)',[buyer,otherBuyer]);
  await db.query("insert into public.products(id,name,slug,active) values($1,'Gomitas','gomitas',true)",[product]);
  await db.query("insert into public.product_variants(id,product_id,weight,price,stock) values($1,$2,'1 kg',250.50,5)",[variant,product]);
});
const reserve=async(qty=2,requestId=randomUUID(),userId=buyer)=>{
  const r=await db.query('select public.chewy_reserve_checkout($1,$2,$3::jsonb,$4) as result',[userId,requestId,JSON.stringify([{variant_id:variant,quantity:qty}]),9900]);
  return r.rows[0].result;
};
const complete=async(r,total=r.amount_total,session='cs_test_fixture')=>(await db.query("select public.chewy_complete_order($1,$2,$3,'mxn','{}') as id",[r.id,session,total])).rows[0].id;
const stock=async()=>(await db.query('select stock from public.product_variants where id=$1',[variant])).rows[0].stock;

test('migración instala RPC y reserva snapshots con centavos exactos',async()=>{
  const r=await reserve();assert.equal(r.amount_total,60000);assert.equal(r.items[0].unit_amount,25050);assert.equal(await stock(),5);
});
test('reintento no duplica reserva y reutilizar clave con otro carrito falla',async()=>{
  const key=randomUUID();const a=await reserve(2,key),b=await reserve(2,key);assert.equal(a.id,b.id);
  await assert.rejects(reserve(3,key),/otro carrito/);
  assert.equal((await db.query('select count(*)::int as n from public.chewy_checkout_reservations')).rows[0].n,1);
});
test('reservas de dos compradores no sobrepasan el saldo',async()=>{
  await reserve(4);await assert.rejects(reserve(2,randomUUID(),otherBuyer),/inventario/);assert.equal(await stock(),5);
});
test('variante inexistente, inactiva y producto inactivo se rechazan',async()=>{
  await db.query('update public.product_variants set active=false');await assert.rejects(reserve(),/disponible/);
  await db.query('update public.product_variants set active=true');await db.query('update public.products set active=false');await assert.rejects(reserve(),/disponible/);
});
test('pago y webhook duplicado crean un pedido y descuentan stock una sola vez',async()=>{
  const r=await reserve();const id=await complete(r);assert.equal(await complete(r),id);assert.equal(await stock(),3);
  assert.equal((await db.query('select count(*)::int as n from public.chewy_orders')).rows[0].n,1);
});
test('importe alterado revierte íntegramente inventario y pedido',async()=>{
  const r=await reserve();await assert.rejects(complete(r,1),/Importe/);assert.equal(await stock(),5);
  assert.equal((await db.query('select count(*)::int as n from public.chewy_orders')).rows[0].n,0);
});
test('sesión distinta no puede consumir una reserva ajena',async()=>{
  const r=await reserve();await db.query('select public.chewy_attach_session($1,$2)',[r.id,'cs_test_original']);await assert.rejects(complete(r),/Sesión incompatible/);assert.equal(await stock(),5);
});
test('expiración libera reserva, sin modificar saldo ni revivir compra',async()=>{
  const r=await reserve(5);await db.query('select public.chewy_release_reservation($1,$2)',[r.id,'cs_test_fixture']);
  await reserve(5,randomUUID(),otherBuyer);await assert.rejects(complete(r),/liberada/);assert.equal(await stock(),5);
});
test('webhook expirado posterior al pago no libera ni repone inventario',async()=>{
  const r=await reserve();await complete(r);await db.query('select public.chewy_release_reservation($1,$2)',[r.id,'cs_test_fixture']);
  const status=(await db.query('select status from public.chewy_checkout_reservations')).rows[0].status;
  assert.equal(status,'paid');assert.equal(await stock(),3);
});
test('pago conserva productos y cantidades agregados al carrito durante Stripe',async()=>{
  const cart=randomUUID();await db.query('insert into public.carts(id,user_id) values($1,$2)',[cart,buyer]);
  await db.query('insert into public.cart_items(cart_id,variant_id,quantity) values($1,$2,4)',[cart,variant]);
  const r=await reserve(2);await complete(r);await complete(r);
  assert.equal((await db.query('select quantity from public.cart_items')).rows[0].quantity,2);
});
test('stock cambiado manualmente causa rollback en lugar de stock negativo',async()=>{
  const r=await reserve(3);await db.query('update public.product_variants set stock=1');
  await assert.rejects(complete(r),/Stock inconsistente/);assert.equal(await stock(),1);
});
test('anon y authenticated no tienen permiso para reservar o leer PII',async()=>{
  const r=await db.query("select has_function_privilege('anon','public.chewy_reserve_checkout(uuid,uuid,jsonb,bigint)','execute') a,has_function_privilege('authenticated','public.chewy_complete_order(uuid,text,bigint,text,jsonb)','execute') b,has_table_privilege('authenticated','public.chewy_orders','select') c");
  assert.deepEqual(r.rows[0],{a:false,b:false,c:false});
});
