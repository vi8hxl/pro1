import type { MaintenanceRequestInput } from "@/lib/validations/payment";
import type { MaintenanceStatus, Tables } from "@/types/database";
import { blankToNull, type DbClient, ServiceError, unwrap, unwrapVoid } from "./client";

export type MaintenanceRequest = Tables<"maintenance_requests">;

export async function listMaintenanceRequests(
  client: DbClient,
): Promise<MaintenanceRequest[]> {
  return unwrap(
    await client
      .from("maintenance_requests")
      .select("*")
      .order("created_at", { ascending: false }),
  );
}

/** A tenant raises a request; owner/apartment ids are taken from the tenancy. */
export async function createMaintenanceRequest(
  client: DbClient,
  input: MaintenanceRequestInput,
  photoPath?: string,
): Promise<MaintenanceRequest> {
  const tenancy = unwrap(
    await client
      .from("tenancies")
      .select("id, apartment_id, owner_id, tenant_id")
      .eq("id", input.tenancy_id)
      .single(),
  );

  return unwrap(
    await client
      .from("maintenance_requests")
      .insert({
        tenancy_id: tenancy.id,
        apartment_id: tenancy.apartment_id,
        owner_id: tenancy.owner_id,
        tenant_id: tenancy.tenant_id,
        title: input.title,
        description: blankToNull(input.description),
        photo_path: photoPath ?? null,
      })
      .select("*")
      .single(),
  );
}

/** Owners move a request between open / in_progress / resolved. */
export async function updateMaintenanceStatus(
  client: DbClient,
  id: string,
  status: MaintenanceStatus,
): Promise<MaintenanceRequest> {
  return unwrap(
    await client
      .from("maintenance_requests")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single(),
  );
}

export async function deleteMaintenanceRequest(
  client: DbClient,
  id: string,
): Promise<void> {
  unwrapVoid(await client.from("maintenance_requests").delete().eq("id", id));
}

/** Upload a photo under the tenant's own folder (see storage policies). */
export async function uploadMaintenancePhoto(
  client: DbClient,
  userId: string,
  file: File,
): Promise<string> {
  const safeName = file.name.replace(/[^\w.-]+/g, "_");
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await client.storage
    .from("maintenance-photos")
    .upload(path, file, { upsert: false, contentType: file.type || undefined });

  if (error) throw new ServiceError(error.message, { cause: error });
  return path;
}

export async function getMaintenancePhotoUrl(
  client: DbClient,
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { data, error } = await client.storage
    .from("maintenance-photos")
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw new ServiceError(error.message, { cause: error });
  return data.signedUrl;
}
