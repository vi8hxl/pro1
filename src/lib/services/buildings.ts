import type { BuildingInput } from "@/lib/validations/property";
import type { Tables } from "@/types/database";
import { blankToNull, type DbClient, unwrap, unwrapMaybe, unwrapVoid } from "./client";

export type Building = Tables<"buildings">;

export async function listBuildings(client: DbClient): Promise<Building[]> {
  return unwrap(
    await client.from("buildings").select("*").order("name", { ascending: true }),
  );
}

export async function getBuilding(
  client: DbClient,
  id: string,
): Promise<Building | null> {
  return unwrapMaybe(
    await client.from("buildings").select("*").eq("id", id).maybeSingle(),
  );
}

export async function createBuilding(
  client: DbClient,
  ownerId: string,
  input: BuildingInput,
): Promise<Building> {
  return unwrap(
    await client
      .from("buildings")
      .insert({
        owner_id: ownerId,
        name: input.name,
        address: blankToNull(input.address),
        notes: blankToNull(input.notes),
      })
      .select("*")
      .single(),
  );
}

export async function updateBuilding(
  client: DbClient,
  id: string,
  input: Partial<BuildingInput>,
): Promise<Building> {
  return unwrap(
    await client
      .from("buildings")
      .update({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.address !== undefined
          ? { address: blankToNull(input.address) }
          : {}),
        ...(input.notes !== undefined ? { notes: blankToNull(input.notes) } : {}),
      })
      .eq("id", id)
      .select("*")
      .single(),
  );
}

export async function deleteBuilding(client: DbClient, id: string): Promise<void> {
  unwrapVoid(await client.from("buildings").delete().eq("id", id));
}
