import type { ApartmentInput } from "@/lib/validations/property";
import type { ApartmentStatus, Tables } from "@/types/database";
import { blankToNull, type DbClient, unwrap, unwrapMaybe, unwrapVoid } from "./client";

export type Apartment = Tables<"apartments">;

/** An apartment plus the building it belongs to (merged in JS, no embed typing). */
export interface ApartmentWithBuilding extends Apartment {
  building_name: string | null;
}

export async function listApartments(
  client: DbClient,
  options: { buildingId?: string; status?: ApartmentStatus } = {},
): Promise<ApartmentWithBuilding[]> {
  let query = client.from("apartments").select("*").order("label", { ascending: true });
  if (options.buildingId) query = query.eq("building_id", options.buildingId);
  if (options.status) query = query.eq("status", options.status);

  const apartments = unwrap(await query);
  const buildings = unwrap(
    await client.from("buildings").select("id, name").order("name"),
  );
  const nameById = new Map(buildings.map((b) => [b.id, b.name]));

  return apartments.map((apartment) => ({
    ...apartment,
    building_name: nameById.get(apartment.building_id) ?? null,
  }));
}

export async function getApartment(
  client: DbClient,
  id: string,
): Promise<Apartment | null> {
  return unwrapMaybe(
    await client.from("apartments").select("*").eq("id", id).maybeSingle(),
  );
}

export async function createApartment(
  client: DbClient,
  ownerId: string,
  input: ApartmentInput,
): Promise<Apartment> {
  return unwrap(
    await client
      .from("apartments")
      .insert({
        owner_id: ownerId,
        building_id: input.building_id,
        label: input.label,
        floor: input.floor ?? null,
        base_rent: input.base_rent,
        security_deposit: input.security_deposit ?? 0,
        notes: blankToNull(input.notes),
      })
      .select("*")
      .single(),
  );
}

export async function updateApartment(
  client: DbClient,
  id: string,
  input: Partial<ApartmentInput>,
): Promise<Apartment> {
  return unwrap(
    await client
      .from("apartments")
      .update({
        ...(input.building_id !== undefined ? { building_id: input.building_id } : {}),
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.floor !== undefined ? { floor: input.floor } : {}),
        ...(input.base_rent !== undefined ? { base_rent: input.base_rent } : {}),
        ...(input.security_deposit !== undefined
          ? { security_deposit: input.security_deposit }
          : {}),
        ...(input.notes !== undefined ? { notes: blankToNull(input.notes) } : {}),
      })
      .eq("id", id)
      .select("*")
      .single(),
  );
}

export async function deleteApartment(client: DbClient, id: string): Promise<void> {
  unwrapVoid(await client.from("apartments").delete().eq("id", id));
}
