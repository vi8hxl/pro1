-- 0005 · Rent charges (one per tenancy per month) and payments

create table public.rent_charges (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid references public.profiles (id) on delete set null,
  period_month date not null, -- always the 1st of the month
  amount_due numeric(12, 2) not null check (amount_due >= 0),
  due_date date not null,
  status public.charge_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- makes monthly generation idempotent
  unique (tenancy_id, period_month)
);

create index rent_charges_owner_idx on public.rent_charges (owner_id);
create index rent_charges_tenant_idx on public.rent_charges (tenant_id);
create index rent_charges_period_idx on public.rent_charges (owner_id, period_month);
create index rent_charges_due_idx on public.rent_charges (due_date) where (status <> 'paid');

create trigger rent_charges_set_updated_at
  before update on public.rent_charges
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- payments (full, partial and advance payments all live here)
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid references public.profiles (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  paid_on date not null default current_date,
  mode public.payment_mode not null default 'cash',
  note text,
  recorded_by uuid references public.profiles (id) on delete set null,
  receipt_no text unique,
  created_at timestamptz not null default now()
);

create index payments_tenancy_idx on public.payments (tenancy_id, paid_on desc);
create index payments_owner_idx on public.payments (owner_id, paid_on desc);
create index payments_tenant_idx on public.payments (tenant_id, paid_on desc);

-- Human-friendly receipt numbers: RNT-<year>-<6 digits>
create sequence if not exists public.payment_receipt_seq;

create or replace function public.fn_assign_receipt_no()
returns trigger
language plpgsql
as $$
begin
  if new.receipt_no is null then
    new.receipt_no :=
      'RNT-' || to_char(coalesce(new.paid_on, current_date), 'YYYY') || '-' ||
      lpad(nextval('public.payment_receipt_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger payments_assign_receipt_no
  before insert on public.payments
  for each row execute function public.fn_assign_receipt_no();
