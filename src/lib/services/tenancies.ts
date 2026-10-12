import { INVITE_EXPIRY_DAYS } from "@/lib/constants";
import { addDays } from "@/lib/dates";
import type {
  ChangeRentInput,
  CreateTenancyInput,
  MoveOutInput,
  UpdateTenancyInput,
} from "@/lib/validations/tenancy";
import type { Tables, TenancyStatus } from "@/types/database";
import { blankToNull, type DbClient, unwrap, unwrapMaybe, unwrapVoid } from "./client";

export type Tenancy = Tables<"tenancies">;

export interface TenancyListItem extends Tenancy {
  apartment_label: string | null;
  building_name: string | null;
  total_charged: number;
  total_paid: number;
  pending: number;
  next_due_date: string | null;
  last_payment_on: string | null;
}

function newInviteToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function inviteExpiry(): string | null {
  return addDays(new Date(), INVITE_EXPIRY_DAYS)?.toISOString() ?? null;
}

/**
 * Tenancies with their flat, building and live balance.
 * An owner gets their own rows; a tenant gets just theirs (RLS).
 */
export async function listTenancies(
  client: DbClient,
  options: { apartmentId?: string; status?: TenancyStatus } = {},
): Promise<TenancyListItem[]> {
  let query = client.from("tenancies").select("*").order("created_at", { ascending: false });
  if (options.apartmentId) query = query.eq("apartment_id", options.apartmentId);
  if (options.status) query = query.eq("status", options.status);

  const tenancies = unwrap(await query);
  if (tenancies.length === 0) return [];

  const apartments = unwrap(
    await client.from("apartments").select("id, label, building_id"),
  );
  const buildings = unwrap(await client.from("buildings").select("id, name"));
  const balances = unwrap(await client.from("v_tenancy_balance").select("*"));

  const apartmentById = new Map(apartments.map((a) => [a.id, a]));
  const buildingNameById = new Map(buildings.map((b) => [b.id, b.name]));
  const balanceByTenancy = new Map(balances.map((b) => [b.tenancy_id, b]));

  return tenancies.map((tenancy) => {
    const apartment = apartmentById.get(tenancy.apartment_id);
    const balance = balanceByTenancy.get(tenancy.id);
    return {
      ...tenancy,
      apartment_label: apartment?.label ?? null,
      building_name: apartment
        ? (buildingNameById.get(apartment.building_id) ?? null)
        : null,
      total_charged: Number(balance?.total_charged ?? 0),
      total_paid: Number(balance?.total_paid ?? 0),
      pending: Number(balance?.pending ?? 0),
      next_due_date: balance?.next_due_date ?? null,
      last_payment_on: balance?.last_payment_on ?? null,
    };
  });
}

export async function getTenancy(
  client: DbClient,
  id: string,
): Promise<Tenancy | null> {
  return unwrapMaybe(
    await client.from("tenancies").select("*").eq("id", id).maybeSingle(),
  );
}

export async function createTenancy(
  client: DbClient,
  ownerId: string,
  input: CreateTenancyInput,
): Promise<Tenancy> {
  const tenancy = unwrap(
    await client
      .from("tenancies")
      .insert({
        owner_id: ownerId,
        apartment_id: input.apartment_id,
        tenant_name: input.tenant_name,
        tenant_phone: blankToNull(input.tenant_phone),
        tenant_email: blankToNull(input.tenant_email),
        move_in_date: input.move_in_date,
        rent_amount: input.rent_amount,
        due_day: input.due_day ?? 1,
        deposit_amount: input.deposit_amount ?? 0,
        invite_token: newInviteToken(),
        invite_expires_at: inviteExpiry(),
      })
      .select("*")
      .single(),
  );

  unwrapVoid(
    await client
      .from("apartments")
      .update({ status: "occupied" })
      .eq("id", input.apartment_id),
  );

  return tenancy;
}

export async function updateTenancy(
  client: DbClient,
  input: UpdateTenancyInput,
): Promise<Tenancy> {
  const { id, ...rest } = input;
  return unwrap(
    await client
      .from("tenancies")
      .update({
        ...(rest.tenant_name !== undefined ? { tenant_name: rest.tenant_name } : {}),
        ...(rest.tenant_phone !== undefined
          ? { tenant_phone: blankToNull(rest.tenant_phone) }
          : {}),
        ...(rest.tenant_email !== undefined
          ? { tenant_email: blankToNull(rest.tenant_email) }
          : {}),
        ...(rest.due_day !== undefined ? { due_day: rest.due_day } : {}),
        ...(rest.deposit_amount !== undefined
          ? { deposit_amount: rest.deposit_amount }
          : {}),
      })
      .eq("id", id)
      .select("*")
      .single(),
  );
}

/** Issue a fresh invite link (e.g. the first one expired or was lost). */
export async function regenerateInvite(
  client: DbClient,
  tenancyId: string,
): Promise<{ invite_token: string | null; invite_expires_at: string | null }> {
  return unwrap(
    await client
      .from("tenancies")
      .update({ invite_token: newInviteToken(), invite_expires_at: inviteExpiry() })
      .eq("id", tenancyId)
      .select("invite_token, invite_expires_at")
      .single(),
  );
}

/** Rent revision: append to history and update the agreed rent. */
export async function changeRent(
  client: DbClient,
  input: ChangeRentInput,
): Promise<Tenancy> {
  unwrapVoid(
    await client.from("rent_history").insert({
      tenancy_id: input.tenancy_id,
      rent_amount: input.rent_amount,
      effective_from: input.effective_from,
      note: blankToNull(input.note),
    }),
  );

  return unwrap(
    await client
      .from("tenancies")
      .update({ rent_amount: input.rent_amount })
      .eq("id", input.tenancy_id)
      .select("*")
      .single(),
  );
}

export async function listRentHistory(client: DbClient, tenancyId: string) {
  return unwrap(
    await client
      .from("rent_history")
      .select("*")
      .eq("tenancy_id", tenancyId)
      .order("effective_from", { ascending: false }),
  );
}

/** End a tenancy, settle the deposit and free the flat (SQL function). */
export async function markMovedOut(
  client: DbClient,
  input: MoveOutInput,
): Promise<void> {
  unwrapVoid(
    await client.rpc("rpc_mark_moved_out", {
      p_tenancy: input.tenancy_id,
      p_move_out: input.move_out_date,
      ...(input.deposit_settled !== undefined
        ? { p_deposit_settled: input.deposit_settled }
        : {}),
    }),
  );
}

/** Accept an invite as the signed-in tenant (SQL function). */
export async function acceptInvite(client: DbClient, token: string): Promise<string> {
  return unwrap(await client.rpc("rpc_accept_invite", { p_token: token }));
}

export interface TenantHome {
  tenancy_id: string;
  apartment_id: string;
  apartment_label: string | null;
  building_name: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  rent_amount: number;
  due_day: number;
  move_in_date: string;
  pending: number;
  next_due_date: string | null;
  months_lived: string;
}

/** The tenant's home summary (SQL function — reads the owner's contact too). */
export async function getTenantHome(client: DbClient): Promise<TenantHome | null> {
  const data = unwrap(await client.rpc("rpc_tenant_home", {}));
  if (!data) return null;
  const home = data as unknown as TenantHome;
  return {
    ...home,
    rent_amount: Number(home.rent_amount ?? 0),
    pending: Number(home.pending ?? 0),
  };
}
