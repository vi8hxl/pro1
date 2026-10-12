-- 0003 · Buildings and apartments

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index buildings_owner_idx on public.buildings (owner_id);

create trigger buildings_set_updated_at
  before update on public.buildings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- apartments
-- owner_id is denormalised from buildings so RLS stays a simple column check
-- (and so a tenant's own flat can be read without a join to buildings).
-- ---------------------------------------------------------------------------
create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  floor integer,
  base_rent numeric(12, 2) not null default 0 check (base_rent >= 0),
  security_deposit numeric(12, 2) not null default 0 check (security_deposit >= 0),
  status public.apartment_status not null default 'vacant',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (building_id, label)
);

create index apartments_owner_idx on public.apartments (owner_id);
create index apartments_building_idx on public.apartments (building_id);
create index apartments_status_idx on public.apartments (owner_id, status);

create trigger apartments_set_updated_at
  before update on public.apartments
  for each row execute function public.set_updated_at();
