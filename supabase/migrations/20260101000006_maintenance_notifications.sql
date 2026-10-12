-- 0006 · Maintenance requests, notifications, reminder log

create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  photo_path text,
  status public.maintenance_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index maintenance_owner_idx on public.maintenance_requests (owner_id, status);
create index maintenance_tenant_idx on public.maintenance_requests (tenant_id);
create index maintenance_tenancy_idx on public.maintenance_requests (tenancy_id);

create trigger maintenance_requests_set_updated_at
  before update on public.maintenance_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notifications (in-app)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

-- ---------------------------------------------------------------------------
-- reminder_log: makes the daily reminder job idempotent (one per kind per day)
-- ---------------------------------------------------------------------------
create table public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  kind public.reminder_kind not null,
  channel text not null default 'email',
  sent_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (tenancy_id, kind, sent_on)
);

create index reminder_log_tenancy_idx on public.reminder_log (tenancy_id, sent_on desc);
