-- 0010 · Notifications: rent due/overdue, maintenance and payment events
--
-- Rent reminders are generated on demand for the signed-in tenant
-- (rpc_sync_my_reminders) so they work without a cron schedule, and are made
-- idempotent by reminder_log. Maintenance and payment notifications are raised
-- by triggers.

-- ---------------------------------------------------------------------------
-- Rent upcoming / overdue for the caller's own tenancies.
-- ---------------------------------------------------------------------------
create or replace function public.rpc_sync_my_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer := 0;
  v_kind public.reminder_kind;
  v_type public.notification_type;
  v_title text;
  v_body text;
  r record;
begin
  if v_uid is null then
    return 0;
  end if;

  for r in
    select
      t.id as tenancy_id,
      rc.amount_due,
      rc.due_date,
      p.grace_period_days,
      (
        select coalesce(sum(amount_due), 0) from public.rent_charges where tenancy_id = t.id
      ) - (
        select coalesce(sum(amount), 0) from public.payments where tenancy_id = t.id
      ) as pending
    from public.tenancies t
    join public.profiles p on p.id = t.owner_id
    join public.rent_charges rc on rc.tenancy_id = t.id and rc.status <> 'paid'
    where t.tenant_id = v_uid
      and t.status = 'active'
    order by rc.due_date
  loop
    if r.pending <= 0 then
      continue;
    end if;

    if r.due_date + r.grace_period_days < current_date then
      v_kind := 'overdue';
      v_type := 'rent_overdue';
      v_title := 'Rent overdue';
      v_body := format(
        'Your rent of ₹%s was due on %s. Please pay as soon as you can.',
        trim(to_char(r.amount_due, 'FM999999999')),
        to_char(r.due_date, 'DD Mon YYYY')
      );
    elsif r.due_date <= current_date + 5 then
      v_kind := 'upcoming';
      v_type := 'rent_upcoming';
      v_title := 'Rent due soon';
      v_body := format(
        '₹%s is due on %s.',
        trim(to_char(r.amount_due, 'FM999999999')),
        to_char(r.due_date, 'DD Mon YYYY')
      );
    else
      continue;
    end if;

    -- insert is a no-op if we already reminded for this charge today
    insert into public.reminder_log (tenancy_id, kind, channel)
    values (r.tenancy_id, v_kind, 'inapp')
    on conflict (tenancy_id, kind, sent_on) do nothing;

    if found then
      insert into public.notifications (user_id, type, title, body, link)
      values (v_uid, v_type, v_title, v_body, '/tenant');
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Maintenance: notify the owner when raised, the tenant when the status moves.
-- ---------------------------------------------------------------------------
create or replace function public.fn_notify_maintenance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.owner_id is not null then
      insert into public.notifications (user_id, type, title, body, link)
      values (
        new.owner_id,
        'maintenance_update',
        'New maintenance request',
        new.title,
        '/owner/maintenance'
      );
    end if;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status and new.tenant_id is not null then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.tenant_id,
      'maintenance_update',
      case new.status
        when 'in_progress' then 'Maintenance started'
        when 'resolved' then 'Maintenance resolved'
        else 'Maintenance updated'
      end,
      new.title,
      '/tenant/maintenance'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists maintenance_notify on public.maintenance_requests;
create trigger maintenance_notify
  after insert or update on public.maintenance_requests
  for each row execute function public.fn_notify_maintenance();

-- ---------------------------------------------------------------------------
-- Payments: notify the tenant when a payment is recorded.
-- ---------------------------------------------------------------------------
create or replace function public.fn_notify_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.tenant_id is not null then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.tenant_id,
      'payment_recorded',
      'Payment received',
      format(
        '₹%s received on %s. Thank you.',
        trim(to_char(new.amount, 'FM999999999')),
        to_char(new.paid_on, 'DD Mon YYYY')
      ),
      '/tenant/payments'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists payments_notify on public.payments;
create trigger payments_notify
  after insert on public.payments
  for each row execute function public.fn_notify_payment();

-- ---------------------------------------------------------------------------
-- Optional: schedule the daily jobs if pg_cron is available. Rent reminders
-- themselves are generated on demand, so nothing breaks without this.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('rentless-generate-charges', '0 1 * * *',
      $job$select public.fn_generate_monthly_charges(current_date);$job$);
    perform cron.schedule('rentless-mark-overdue', '15 1 * * *',
      $job$select public.fn_mark_overdue();$job$);
  end if;
exception when others then
  raise notice 'pg_cron not scheduled: %', sqlerrm;
end;
$$;
