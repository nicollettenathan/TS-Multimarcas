create extension if not exists pgcrypto;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year text,
  km text,
  transmission text,
  price text not null,
  image text,
  status text not null default 'disponivel' check (status in ('disponivel','vendido','arquivado')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "public can read vehicles"
on public.vehicles for select
to anon, authenticated
using (true);

create policy "authenticated can insert vehicles"
on public.vehicles for insert
to authenticated
with check (true);

create policy "authenticated can update vehicles"
on public.vehicles for update
to authenticated
using (true)
with check (true);

create policy "authenticated can delete vehicles"
on public.vehicles for delete
to authenticated
using (true);
