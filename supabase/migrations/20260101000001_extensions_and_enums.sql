-- 0001 · Extensions and enum types
-- Rentless data layer. Run with `supabase db push` (or `supabase migration up`).

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('owner', 'tenant');
create type public.apartment_status as enum ('vacant', 'occupied');
create type public.tenancy_status as enum ('active', 'moved_out');
create type public.charge_status as enum ('pending', 'partial', 'paid', 'overdue');
create type public.payment_mode as enum ('cash', 'upi', 'bank', 'other');
create type public.maintenance_status as enum ('open', 'in_progress', 'resolved');
create type public.notification_type as enum (
  'rent_upcoming',
  'rent_overdue',
  'payment_recorded',
  'maintenance_update',
  'invite',
  'system'
);
create type public.reminder_kind as enum ('upcoming', 'overdue');
