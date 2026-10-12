-- 0008 · Row Level Security
-- Deny-by-default: RLS is enabled on every table and only the policies below
-- grant access. Tenants see only their own tenancy; owners see only their own
-- buildings and everything under them.

alter table public.profiles            enable row level security;
alter table public.buildings           enable row level security;
alter table public.apartments          enable row level security;
alter table public.tenancies           enable row level security;
alter table public.rent_history        enable row level security;
alter table public.rent_charges        enable row level security;
alter table public.payments            enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.notifications       enable row level security;
alter table public.reminder_log        enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles_select_self" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- buildings — owner only
-- ---------------------------------------------------------------------------
create policy "buildings_owner_all" on public.buildings
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- apartments — owner full access; tenant may read the flat they live in
-- ---------------------------------------------------------------------------
create policy "apartments_owner_all" on public.apartments
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "apartments_tenant_read" on public.apartments
  for select using (
    exists (
      select 1 from public.tenancies t
      where t.apartment_id = apartments.id and t.tenant_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- tenancies — owner full access; tenant reads their own
-- ---------------------------------------------------------------------------
create policy "tenancies_owner_all" on public.tenancies
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "tenancies_tenant_read" on public.tenancies
  for select using (tenant_id = auth.uid());

-- ---------------------------------------------------------------------------
-- rent_history — via the owning tenancy
-- ---------------------------------------------------------------------------
create policy "rent_history_owner_all" on public.rent_history
  for all using (
    exists (
      select 1 from public.tenancies t
      where t.id = rent_history.tenancy_id and t.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.tenancies t
      where t.id = rent_history.tenancy_id and t.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- rent_charges
-- ---------------------------------------------------------------------------
create policy "rent_charges_owner_all" on public.rent_charges
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "rent_charges_tenant_read" on public.rent_charges
  for select using (tenant_id = auth.uid());

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create policy "payments_owner_all" on public.payments
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "payments_tenant_read" on public.payments
  for select using (tenant_id = auth.uid());

-- ---------------------------------------------------------------------------
-- maintenance_requests — owner manages; tenant raises and reads their own
-- ---------------------------------------------------------------------------
create policy "maintenance_owner_all" on public.maintenance_requests
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "maintenance_tenant_read" on public.maintenance_requests
  for select using (tenant_id = auth.uid());

create policy "maintenance_tenant_insert" on public.maintenance_requests
  for insert with check (tenant_id = auth.uid());

-- ---------------------------------------------------------------------------
-- notifications — own rows only
-- ---------------------------------------------------------------------------
create policy "notifications_self_all" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reminder_log — owners may read their own; writes are service-role only
-- ---------------------------------------------------------------------------
create policy "reminder_log_owner_read" on public.reminder_log
  for select using (
    exists (
      select 1 from public.tenancies t
      where t.id = reminder_log.tenancy_id and t.owner_id = auth.uid()
    )
  );
