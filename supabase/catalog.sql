-- SOLO para un proyecto Supabase vacío. Para la base existente usar únicamente
-- migrations/20261119_stripe_checkout.sql después de confirmar sus columnas.
begin;
create table public.categories (
  id uuid primary key default gen_random_uuid(), name text not null,
  slug text not null unique, description text, image_url text, active boolean not null default true
);
create table public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.categories,
  name text not null, slug text not null unique, description text,
  active boolean not null default false, created_at timestamptz not null default now()
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products,
  weight text not null, sku text unique, price numeric(12,2) not null check(price > 0),
  stock integer not null default 0 check(stock >= 0), active boolean not null default true
);
create index on public.product_variants(product_id);
create table public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products,
  image_url text not null, is_main boolean not null default false, position integer not null default 0
);
create index on public.product_images(product_id);
create table public.product_details (
  product_id uuid primary key references public.products,
  long_description text, ingredients text, nutrition_info jsonb, storage_info text, usage_info text
);
create table public.carts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users,
  created_at timestamptz not null default now()
);
create table public.cart_items (
  id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.carts on delete cascade,
  variant_id uuid not null references public.product_variants, quantity integer not null check(quantity between 1 and 99),
  price_snapshot numeric(12,2), name_snapshot text, variant_label_snapshot text, image_snapshot text,
  unique(cart_id,variant_id)
);
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_details enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
create policy catalog_categories on public.categories for select to anon,authenticated using(active);
create policy catalog_products on public.products for select to anon,authenticated using(active);
create policy catalog_variants on public.product_variants for select to anon,authenticated using(active and exists(select 1 from public.products p where p.id=product_id and p.active));
create policy catalog_images on public.product_images for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.active));
create policy catalog_details on public.product_details for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.active));
create policy own_cart on public.carts for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_cart_items on public.cart_items for all to authenticated using(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid())) with check(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid()));
grant select on public.categories,public.products,public.product_variants,public.product_images,public.product_details to anon,authenticated;
grant select,insert,update,delete on public.carts,public.cart_items to authenticated;
grant all on public.categories,public.products,public.product_variants,public.product_images,public.product_details,public.carts,public.cart_items to service_role;
commit;
