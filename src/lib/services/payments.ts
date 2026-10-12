import type { RecordPaymentInput } from "@/lib/validations/payment";
import type { Tables } from "@/types/database";
import { blankToNull, type DbClient, unwrap, unwrapMaybe, unwrapVoid } from "./client";

export type Payment = Tables<"payments">;

export async function listPaymentsByTenancy(
  client: DbClient,
  tenancyId: string,
): Promise<Payment[]> {
  return unwrap(
    await client
      .from("payments")
      .select("*")
      .eq("tenancy_id", tenancyId)
      .order("paid_on", { ascending: false }),
  );
}

export async function listOwnerPayments(
  client: DbClient,
  options: { from?: string; to?: string; limit?: number } = {},
): Promise<Payment[]> {
  let query = client
    .from("payments")
    .select("*")
    .order("paid_on", { ascending: false });
  if (options.from) query = query.gte("paid_on", options.from);
  if (options.to) query = query.lte("paid_on", options.to);
  if (options.limit) query = query.limit(options.limit);
  return unwrap(await query);
}

export async function getPayment(
  client: DbClient,
  id: string,
): Promise<Payment | null> {
  return unwrapMaybe(await client.from("payments").select("*").eq("id", id).maybeSingle());
}

/**
 * Record a payment (full, partial or advance). The receipt number and the
 * charge statuses are assigned by database triggers.
 */
export async function recordPayment(
  client: DbClient,
  ownerId: string,
  recordedBy: string,
  input: RecordPaymentInput,
): Promise<Payment> {
  const tenancy = unwrap(
    await client
      .from("tenancies")
      .select("id, tenant_id")
      .eq("id", input.tenancy_id)
      .single(),
  );

  return unwrap(
    await client
      .from("payments")
      .insert({
        tenancy_id: input.tenancy_id,
        owner_id: ownerId,
        tenant_id: tenancy.tenant_id,
        amount: input.amount,
        paid_on: input.paid_on,
        mode: input.mode,
        note: blankToNull(input.note),
        recorded_by: recordedBy,
      })
      .select("*")
      .single(),
  );
}

export async function deletePayment(client: DbClient, id: string): Promise<void> {
  unwrapVoid(await client.from("payments").delete().eq("id", id));
}
