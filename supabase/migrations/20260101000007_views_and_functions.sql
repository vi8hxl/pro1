-- 0007 · Derived views and business-logic functions

-- ---------------------------------------------------------------------------
-- Balance per tenancy: charged − paid = pending, plus the next unsettled due date.
-- security_invoker so the caller's RLS applies to the underlying tables.
-- ---------------------------------------------------------------------------
create or replace view public.v_tenancy_balance
with (security_invoker = true) as
select
  t.id as tenancy_id,
  t.owner_id,
  t.tenant_id,
  coalesce(c.total_charged, 0)::numeric(12, 2) as total_charged,
  coalesce(p.total_paid, 0)::numeric(12, 2) as total_paid,
  (coalesce(c.total_charged, 0) - coalesce(p.total_paid, 0))::numeric(12, 2) as pending,
  p.last_payment_on,
  c.next_due_date
from public.tenancies t
left join (
  select
    tenancy_id,
    sum(amount_due) as total_charged,
    min(due_date) filter (where status <> 'paid') as next_due_date
  from public.rent_charges
  group by tenancy_id
) c on c.tenancy_id = t.id
left join (
  select
    tenancy_id,
    sum(amount) as total_paid,
    max(paid_on) as last_payment_on
  from public.payments
  group by tenancy_id
) p on p.tenancy_id = t.id;

-- ---------------------------------------------------------------------------
-- Months lived ("X months Y days" is derived from this interval in the app).
-- ---------------------------------------------------------------------------
create or replace function public.fn_months_lived(
  p_from date,
  p_to date default current_date
)
returns interval
language sql
stable
as $$
  select age(p_to, p_from);
$$;

-- ---------------------------------------------------------------------------
-- Monthly rent generation. Idempotent: the unique (tenancy_id, period_month)
-- key means a second run in the same month inserts nothing new.
-- Returns the number of charges created.
-- ---------------------------------------------------------------------------
create or replace function public.fn_generate_monthly_charges(
  p_run_date date default current_date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period date := date_trunc('month', p_run_date)::date;
  v_created integer := 0;
  r record;
begin
  for r in
    select
      t.id,
      t.owner_id,
      t.tenant_id,
      t.due_day,
      (v_period + make_interval(days => t.due_day - 1))::date as due_date,
      coalesce(
        (
          select rh.rent_amount
          from public.rent_history rh
          where rh.tenancy_id = t.id
            and rh.effective_from <= v_period
          order by rh.effective_from desc
          limit 1
        ),
        t.rent_amount
      ) as rent
    from public.tenancies t
    where t.status = 'active'
      and t.move_in_date <= (v_period + make_interval(days => t.due_day - 1))::date
      and t.due_day <= extract(day from p_run_date)::integer
  loop
    insert into public.rent_charges (
      tenancy_id, owner_id, tenant_id, period_month, amount_due, due_date
    )
    values (r.id, r.owner_id, r.tenant_id, v_period, r.rent, r.due_date)
    on conflict (tenancy_id, period_month) do nothing;

    if found then
      v_created := v_created + 1;
    end if;
  end loop;

  return v_created;
end;
$$;

-- ---------------------------------------------------------------------------
-- Allocate a tenancy's payments across its charges, oldest first, and set each
-- charge's status. Handles partial payments and advances (a credit simply makes
-- `pending` negative on the balance view).
-- ---------------------------------------------------------------------------
create or replace function public.fn_recompute_charge_statuses(p_tenancy uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paid numeric(12, 2);
  v_grace integer;
  v_cumulative numeric(12, 2) := 0;
  r record;
begin
  select coalesce(sum(amount), 0) into v_paid
  from public.payments
  where tenancy_id = p_tenancy;

  select coalesce(pr.grace_period_days, 3) into v_grace
  from public.tenancies t
  join public.profiles pr on pr.id = t.owner_id
  where t.id = p_tenancy;
  v_grace := coalesce(v_grace, 3);

  for r in
    select id, amount_due, due_date
    from public.rent_charges
    where tenancy_id = p_tenancy
    order by period_month
  loop
    update public.rent_charges
    set status = case
      when v_paid >= v_cumulative + r.amount_due then 'paid'
      when v_paid > v_cumulative then 'partial'
      when r.due_date + v_grace < current_date then 'overdue'
      else 'pending'
    end
    where id = r.id;

    v_cumulative := v_cumulative + r.amount_due;
  end loop;
end;
$$;

create or replace function public.fn_payments_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.fn_recompute_charge_statuses(old.tenancy_id);
    return old;
  end if;

  perform public.fn_recompute_charge_statuses(new.tenancy_id);
  if tg_op = 'UPDATE' and old.tenancy_id is distinct from new.tenancy_id then
    perform public.fn_recompute_charge_statuses(old.tenancy_id);
  end if;
  return new;
end;
$$;

create trigger payments_sync_charge_status
  after insert or update or delete on public.payments
  for each row execute function public.fn_payments_sync();

-- ---------------------------------------------------------------------------
-- Flip unsettled charges past (due_date + grace) to 'overdue'. Daily job.
-- ---------------------------------------------------------------------------
create or replace function public.fn_mark_overdue()
returns integer
language sql
security definer
set search_path = public
as $$
  with updated as (
    update public.rent_charges rc
    set status = 'overdue'
    from public.profiles p
    where p.id = rc.owner_id
      and rc.status in ('pending', 'partial')
      and rc.due_date + p.grace_period_days < current_date
    returning 1
  )
  select count(*)::integer from updated;
$$;

-- ---------------------------------------------------------------------------
-- Owner dashboard rollup (single round-trip).
-- ---------------------------------------------------------------------------
create or replace function public.rpc_owner_dashboard()
returns jsonb
language sql
security invoker
stable
set search_path = public
as $$
  select jsonb_build_object(
    'expected_this_month', coalesce((
      select sum(amount_due) from public.rent_charges
      where owner_id = auth.uid() and period_month = date_trunc('month', current_date)::date
    ), 0),
    'collected_this_month', coalesce((
      select sum(amount) from public.payments
      where owner_id = auth.uid() and paid_on >= date_trunc('month', current_date)::date
    ), 0),
    'total_pending',
      coalesce((select sum(amount_due) from public.rent_charges where owner_id = auth.uid()), 0)
      - coalesce((select sum(amount) from public.payments where owner_id = auth.uid()), 0),
    'tenant_count', (
      select count(*) from public.tenancies
      where owner_id = auth.uid() and status = 'active'
    ),
    'vacant_count', (
      select count(*) from public.apartments
      where owner_id = auth.uid() and status = 'vacant'
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- Last N months of expected vs collected, for the dashboard chart and reports.
-- ---------------------------------------------------------------------------
create or replace function public.rpc_owner_monthly(p_months integer default 6)
returns table (period_month date, expected numeric, collected numeric)
language sql
security invoker
stable
set search_path = public
as $$
  with periods as (
    select generate_series(
      date_trunc('month', current_date) - make_interval(months => greatest(p_months, 1) - 1),
      date_trunc('month', current_date),
      interval '1 month'
    )::date as period_month
  )
  select
    pe.period_month,
    coalesce((
      select sum(rc.amount_due) from public.rent_charges rc
      where rc.owner_id = auth.uid() and rc.period_month = pe.period_month
    ), 0)::numeric as expected,
    coalesce((
      select sum(p.amount) from public.payments p
      where p.owner_id = auth.uid()
        and p.paid_on >= pe.period_month
        and p.paid_on < pe.period_month + interval '1 month'
    ), 0)::numeric as collected
  from periods pe
  order by pe.period_month;
$$;

-- ---------------------------------------------------------------------------
-- Tenant home summary. SECURITY DEFINER because it reads the owner's profile
-- (which RLS hides from tenants); it is safe because it is filtered to the
-- caller's own tenancy.
-- ---------------------------------------------------------------------------
create or replace function public.rpc_tenant_home()
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  select jsonb_build_object(
    'tenancy_id', t.id,
    'apartment_id', t.apartment_id,
    'apartment_label', a.label,
    'building_name', b.name,
    'owner_name', op.full_name,
    'owner_phone', op.phone,
    'rent_amount', t.rent_amount,
    'due_day', t.due_day,
    'move_in_date', t.move_in_date,
    'pending',
      coalesce((select sum(amount_due) from public.rent_charges where tenancy_id = t.id), 0)
      - coalesce((select sum(amount) from public.payments where tenancy_id = t.id), 0),
    'next_due_date', (
      select min(due_date) from public.rent_charges
      where tenancy_id = t.id and status <> 'paid'
    ),
    'months_lived', public.fn_months_lived(t.move_in_date, coalesce(t.move_out_date, current_date))
  )
  from public.tenancies t
  join public.apartments a on a.id = t.apartment_id
  join public.buildings b on b.id = a.building_id
  join public.profiles op on op.id = t.owner_id
  where t.tenant_id = auth.uid()
  order by t.created_at desc
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Accept an invite: link the caller to the tenancy and occupy the flat.
-- Single-use — the token is cleared on success.
-- ---------------------------------------------------------------------------
create or replace function public.rpc_accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenancy public.tenancies;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'You must be signed in to accept an invite';
  end if;

  select * into v_tenancy
  from public.tenancies
  where invite_token = p_token
  for update;

  if not found then
    raise exception 'This invite is not valid';
  end if;

  if v_tenancy.tenant_id is not null and v_tenancy.tenant_id <> v_uid then
    raise exception 'This invite has already been used';
  end if;

  if v_tenancy.invite_expires_at is not null and v_tenancy.invite_expires_at < now() then
    raise exception 'This invite has expired';
  end if;

  update public.tenancies
  set tenant_id = v_uid,
      invite_token = null,
      invite_expires_at = null,
      updated_at = now()
  where id = v_tenancy.id;

  update public.apartments
  set status = 'occupied', updated_at = now()
  where id = v_tenancy.apartment_id;

  update public.rent_charges
  set tenant_id = v_uid
  where tenancy_id = v_tenancy.id and tenant_id is null;

  update public.payments
  set tenant_id = v_uid
  where tenancy_id = v_tenancy.id and tenant_id is null;

  insert into public.notifications (user_id, type, title, body)
  values (v_uid, 'invite', 'Welcome to Rentless', 'Your tenancy is now linked.');

  return v_tenancy.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Move a tenant out: end the tenancy, settle the deposit, free the flat.
-- ---------------------------------------------------------------------------
create or replace function public.rpc_mark_moved_out(
  p_tenancy uuid,
  p_move_out date,
  p_deposit_settled numeric default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_apartment uuid;
begin
  select apartment_id into v_apartment
  from public.tenancies
  where id = p_tenancy and owner_id = auth.uid();

  if v_apartment is null then
    raise exception 'Tenancy not found or not permitted';
  end if;

  update public.tenancies
  set status = 'moved_out',
      move_out_date = p_move_out,
      deposit_settled = p_deposit_settled,
      invite_token = null,
      invite_expires_at = null,
      updated_at = now()
  where id = p_tenancy;

  update public.apartments
  set status = 'vacant', updated_at = now()
  where id = v_apartment;
end;
$$;
