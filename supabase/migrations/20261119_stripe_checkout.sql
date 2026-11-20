-- Aditiva: no sustituye las tablas ni políticas existentes del catálogo/carrito.
-- IDs de variante guardados como texto para admitir catálogo UUID o text.
begin;
do $$
begin
  if to_regclass('public.product_variants') is null or to_regclass('public.products') is null then
    raise exception 'Falta el catálogo. En base nueva ejecutar primero supabase/catalog.sql.';
  end if;
  -- Falla antes de instalar si la base no coincide con el contrato del frontend.
  perform v.id,v.product_id,v.price,v.stock,v.active,v.weight,p.name,p.active
    from public.product_variants v join public.products p on p.id=v.product_id limit 0;
end $$;

create table public.chewy_checkout_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users,
  request_id uuid not null,
  status text not null default 'reserved' check(status in ('reserved','paid','expired')),
  stripe_session_id text unique,
  items jsonb not null,
  request_items jsonb not null,
  shipping_cents bigint not null check(shipping_cents >= 0),
  amount_total bigint not null check(amount_total > 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now()+interval '35 minutes',
  unique(user_id,request_id)
);
create index chewy_pending_reservations on public.chewy_checkout_reservations(created_at) where status='reserved';
create table public.chewy_orders (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.chewy_checkout_reservations,
  stripe_session_id text not null unique,
  user_id uuid not null references auth.users,
  status text not null default 'paid' check(status in ('paid','preparing','shipped','delivered')),
  amount_total bigint not null check(amount_total > 0),
  currency text not null default 'mxn' check(currency='mxn'),
  items jsonb not null,
  checkout_data jsonb not null,
  created_at timestamptz not null default now()
);
create index chewy_orders_user on public.chewy_orders(user_id,created_at desc);
alter table public.chewy_checkout_reservations enable row level security;
alter table public.chewy_orders enable row level security;
-- Pedidos sólo vía API autenticada; sin acceso directo a PII desde el navegador.
revoke all on public.chewy_checkout_reservations,public.chewy_orders from anon,authenticated;
grant all on public.chewy_checkout_reservations,public.chewy_orders to service_role;

create function public.chewy_checkout_ready() returns boolean
language sql security definer set search_path=public,pg_temp as $$ select true $$;

create function public.chewy_reserve_checkout(p_user_id uuid,p_request_id uuid,p_items jsonb,p_shipping_cents bigint)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  existing public.chewy_checkout_reservations;
  entry jsonb; variant record; held bigint; qty integer;
  snapshot jsonb := '[]'; total bigint := 0;
begin
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 50 or p_shipping_cents is null or p_shipping_cents<0 then raise exception 'Carrito inválido'; end if;
  if (select count(distinct value->>'variant_id') from jsonb_array_elements(p_items)) <> jsonb_array_length(p_items) then raise exception 'Variantes duplicadas'; end if;
  if exists(select 1 from jsonb_array_elements(p_items) where value->>'variant_id' is null or not coalesce(value->>'quantity','') ~ '^[1-9][0-9]?$') then raise exception 'Cantidad inválida'; end if;
  -- Serializa dos peticiones con la misma clave antes de consultar/insertar.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text||p_request_id::text,0));
  select * into existing from public.chewy_checkout_reservations where user_id=p_user_id and request_id=p_request_id for update;
  if found then
    if existing.request_items<>p_items then raise exception 'El intento corresponde a otro carrito'; end if;
    return to_jsonb(existing);
  end if;
  -- Bloquear todas las variantes en orden estable evita sobreventa y deadlocks.
  perform v.id from public.product_variants v
    where v.id::text in(select value->>'variant_id' from jsonb_array_elements(p_items))
    order by v.id for update;
  for entry in select value from jsonb_array_elements(p_items) loop
    qty := (entry->>'quantity')::integer;
    select v.id::text as id,v.stock,v.price,v.weight,v.active as variant_active,p.active as product_active,p.name
      into variant from public.product_variants v join public.products p on p.id=v.product_id
      where v.id::text=entry->>'variant_id' for share of p;
    if not found or not variant.variant_active or not variant.product_active then raise exception 'Producto no disponible'; end if;
    if variant.price is null or variant.price<=0 or variant.price*100<>trunc(variant.price*100) then raise exception 'Precio inválido'; end if;
    select coalesce(sum((line->>'quantity')::integer),0) into held
      from public.chewy_checkout_reservations r cross join lateral jsonb_array_elements(r.items) line
      where r.status='reserved' and line->>'variant_id'=variant.id;
    -- No liberar por reloj: un pago puede estar confirmado y su webhook retrasado.
    if variant.stock is null or variant.stock-held<qty then raise exception 'No hay suficiente inventario'; end if;
    snapshot := snapshot || jsonb_build_array(jsonb_build_object('variant_id',variant.id,'quantity',qty,'unit_amount',(variant.price*100)::bigint,'name',variant.name,'weight',variant.weight));
    total := total+(variant.price*100)::bigint*qty;
  end loop;
  insert into public.chewy_checkout_reservations(user_id,request_id,request_items,items,shipping_cents,amount_total)
    values(p_user_id,p_request_id,p_items,snapshot,p_shipping_cents,total+p_shipping_cents) returning * into existing;
  return to_jsonb(existing);
end $$;

create function public.chewy_attach_session(p_reservation_id uuid,p_session_id text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  update public.chewy_checkout_reservations set stripe_session_id=p_session_id
    where id=p_reservation_id and (stripe_session_id is null or stripe_session_id=p_session_id);
  if not found then raise exception 'Reserva incompatible con la sesión'; end if;
end $$;

create function public.chewy_release_reservation(p_reservation_id uuid,p_session_id text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  update public.chewy_checkout_reservations set status='expired',stripe_session_id=coalesce(stripe_session_id,p_session_id)
    where id=p_reservation_id and status='reserved' and (stripe_session_id is null or stripe_session_id=p_session_id);
end $$;

create function public.chewy_complete_order(p_reservation_id uuid,p_session_id text,p_amount_total bigint,p_currency text,p_checkout_data jsonb)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.chewy_checkout_reservations; entry jsonb; order_id uuid;
begin
  select * into r from public.chewy_checkout_reservations where id=p_reservation_id for update;
  if not found then raise exception 'Reserva no encontrada'; end if;
  if r.stripe_session_id is not null and r.stripe_session_id<>p_session_id then raise exception 'Sesión incompatible'; end if;
  select id into order_id from public.chewy_orders where reservation_id=r.id;
  if found then return order_id; end if;
  if r.status<>'reserved' then raise exception 'Reserva liberada. Requiere conciliación manual del pago'; end if;
  if p_amount_total is distinct from r.amount_total or p_currency is distinct from 'mxn' then raise exception 'Importe o moneda incompatible'; end if;
  perform v.id from public.product_variants v where v.id::text in(select value->>'variant_id' from jsonb_array_elements(r.items)) order by v.id for update;
  for entry in select value from jsonb_array_elements(r.items) loop
    update public.product_variants set stock=stock-(entry->>'quantity')::integer
      where id::text=entry->>'variant_id' and stock>=(entry->>'quantity')::integer;
    if not found then raise exception 'Stock inconsistente. Requiere conciliación manual del pago'; end if;
  end loop;
  insert into public.chewy_orders(reservation_id,stripe_session_id,user_id,amount_total,currency,items,checkout_data)
    values(r.id,p_session_id,r.user_id,p_amount_total,p_currency,r.items,p_checkout_data) returning id into order_id;
  update public.chewy_checkout_reservations set status='paid',stripe_session_id=p_session_id where id=r.id;
  -- No vaciar todo el carrito: el comprador pudo agregar productos durante el pago.
  -- Descontar sólo las cantidades compradas; reintentos no vuelven a ejecutar esto.
  delete from public.cart_items ci using public.carts c
    where ci.cart_id=c.id and c.user_id=r.user_id
    and exists(select 1 from jsonb_array_elements(r.items) i where ci.variant_id::text=i->>'variant_id' and ci.quantity<=(i->>'quantity')::integer);
  update public.cart_items ci set quantity=ci.quantity-(i.value->>'quantity')::integer
    from public.carts c,jsonb_array_elements(r.items) i
    where ci.cart_id=c.id and c.user_id=r.user_id and ci.variant_id::text=i.value->>'variant_id';
  return order_id;
end $$;

revoke all on function public.chewy_checkout_ready() from public,anon,authenticated;
revoke all on function public.chewy_reserve_checkout(uuid,uuid,jsonb,bigint) from public,anon,authenticated;
revoke all on function public.chewy_attach_session(uuid,text) from public,anon,authenticated;
revoke all on function public.chewy_release_reservation(uuid,text) from public,anon,authenticated;
revoke all on function public.chewy_complete_order(uuid,text,bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.chewy_checkout_ready() to service_role;
grant execute on function public.chewy_reserve_checkout(uuid,uuid,jsonb,bigint) to service_role;
grant execute on function public.chewy_attach_session(uuid,text) to service_role;
grant execute on function public.chewy_release_reservation(uuid,text) to service_role;
grant execute on function public.chewy_complete_order(uuid,text,bigint,text,jsonb) to service_role;
commit;
