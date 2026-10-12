-- Rentless · local development seed
--
-- Creates two demo accounts (both password: "password"):
--   owner@rentless.test   → owner  (Asha Properties)
--   tenant@rentless.test  → tenant (Ravi Kumar, in flat A-101)
--
-- Run against a LOCAL Supabase only:  supabase db reset
-- It inserts directly into auth.users, which is not appropriate for production.

begin;

-- ---------------------------------------------------------------------------
-- Auth users (profiles are created by the on_auth_user_created trigger)
-- ---------------------------------------------------------------------------
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'owner@rentless.test',
    crypt('password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Asha Properties"}', now(), now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'tenant@rentless.test',
    crypt('password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ravi Kumar"}', now(), now()
  )
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, created_at, updated_at, last_sign_in_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'email',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"owner@rentless.test"}',
    now(), now(), now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'email',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"tenant@rentless.test"}',
    now(), now(), now()
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
update public.profiles
set role = 'owner', full_name = 'Asha Properties', onboarded = true,
    phone = '+919000000001', grace_period_days = 3
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles
set role = 'tenant', full_name = 'Ravi Kumar', onboarded = true,
    phone = '+919000000002'
where id = '22222222-2222-2222-2222-222222222222';

-- ---------------------------------------------------------------------------
-- Building + apartments
-- ---------------------------------------------------------------------------
insert into public.buildings (id, owner_id, name, address)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Sunrise Residency',
  '12 MG Road, Bengaluru 560001'
)
on conflict (id) do nothing;

insert into public.apartments (id, building_id, owner_id, label, floor, base_rent, security_deposit, status)
values
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'A-101', 1, 12000, 24000, 'occupied'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'A-102', 1, 13500, 27000, 'vacant'),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'A-201', 2, 15000, 30000, 'vacant')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Tenancy (already linked) + an initial rent history row via trigger
-- ---------------------------------------------------------------------------
insert into public.tenancies (
  id, apartment_id, owner_id, tenant_id, tenant_name, tenant_phone, tenant_email,
  move_in_date, rent_amount, due_day, deposit_amount, status
)
values (
  '77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Ravi Kumar', '+919000000002', 'tenant@rentless.test',
  (current_date - interval '95 days')::date, 12000, 5, 24000, 'active'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Charges for the last three months, then a payment against the oldest one
-- ---------------------------------------------------------------------------
select public.fn_generate_monthly_charges(current_date);
select public.fn_generate_monthly_charges((current_date - interval '1 month')::date);
select public.fn_generate_monthly_charges((current_date - interval '2 months')::date);

insert into public.payments (
  tenancy_id, owner_id, tenant_id, amount, paid_on, mode, note, recorded_by
)
values (
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  8000, (current_date - interval '20 days')::date, 'upi',
  'Partial payment for last month', '11111111-1111-1111-1111-111111111111'
);

commit;
