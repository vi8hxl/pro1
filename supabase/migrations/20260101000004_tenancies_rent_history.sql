-- 0004 · Tenancies and rent history

create table public.tenancies (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments (id) on delete restrict,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  -- null until the tenant accepts the invite and links their account
  tenant_id uuid references public.profiles (id) on delete set null,
  tenant_name text not null,
  tenant_phone text,
  tenant_email citext,
  move_in_date date not null,
  move_out_date date,
  rent_amount numeric(12, 2) not null check (rent_amount >= 0),
  due_day integer not null default 1 check (due_day between 1 and 28),
  deposit_amount numeric(12, 2) not null default 0 check (deposit_amount >= 0),
  deposit_settled numeric(12, 2),
  status public.tenancy_status not null default 'active',
  invite_token text unique,
  invite_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (move_out_date is null or move_out_date >= move_in_date)
);

create index tenancies_owner_idx on public.tenancies (owner_id);
create index tenancies_tenant_idx on public.tenancies (tenant_id);
create index tenancies_apartment_idx on public.tenancies (apartment_id);
create index tenancies_status_idx on public.tenancies (owner_id, status);

create trigger tenancies_set_updated_at
  before update on public.tenancies
  for each row execute function public.set_updated_at();

-- Only one active tenancy per apartment at a time.
create unique index tenancies_one_active_per_apartment
  on public.tenancies (apartment_id)
  where (status = 'active');

-- ---------------------------------------------------------------------------
-- rent_history: rent revisions with effective dates. The current rent is the
-- row with the latest effective_from <= the period being billed.
-- ---------------------------------------------------------------------------
create table public.rent_history (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  rent_amount numeric(12, 2) not null check (rent_amount >= 0),
  effective_from date not null,
  note text,
  created_at timestamptz not null default now(),
  unique (tenancy_id, effective_from)
);

create index rent_history_tenancy_idx on public.rent_history (tenancy_id, effective_from desc);

-- Record the starting rent whenever a tenancy is created.
create or replace function public.fn_seed_rent_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.rent_history (tenancy_id, rent_amount, effective_from, note)
  values (new.id, new.rent_amount, new.move_in_date, 'Initial rent')
  on conflict (tenancy_id, effective_from) do nothing;
  return new;
end;
$$;

create trigger tenancies_seed_rent_history
  after insert on public.tenancies
  for each row execute function public.fn_seed_rent_history();
