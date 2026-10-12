-- 0009 · Storage buckets + object policies

insert into storage.buckets (id, name, public)
values ('maintenance-photos', 'maintenance-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- maintenance-photos — written by the tenant under their own folder
-- (<tenant_id>/<file>); readable by that tenant and by the owner of the
-- related request.
-- ---------------------------------------------------------------------------
create policy "maintenance_photos_tenant_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'maintenance-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "maintenance_photos_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'maintenance-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.maintenance_requests mr
        where mr.photo_path = storage.objects.name
          and mr.owner_id = auth.uid()
      )
    )
  );

create policy "maintenance_photos_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'maintenance-photos'
    and exists (
      select 1 from public.maintenance_requests mr
      where mr.photo_path = storage.objects.name
        and mr.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- receipts — generated PDFs written server-side as
-- <owner_id>/<payment_id>.pdf. Readable by the owning owner or the tenant.
-- ---------------------------------------------------------------------------
create policy "receipts_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.payments pay
        where pay.tenant_id = auth.uid()
          and pay.owner_id::text = (storage.foldername(name))[1]
      )
    )
  );
