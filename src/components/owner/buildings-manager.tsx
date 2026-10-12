"use client";

import { useActionState } from "react";
import { AlertCircleIcon, Building2Icon, CircleCheckIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createApartmentAction,
  createBuildingAction,
  deleteApartmentAction,
  deleteBuildingAction,
} from "@/lib/actions/property";
import type { AuthFormState } from "@/lib/auth/actions";
import { Money } from "@/components/shared/money";
import { useT } from "@/lib/i18n/provider";
import type { ApartmentWithBuilding } from "@/lib/services/apartments";
import type { Building } from "@/lib/services/buildings";

const initial: AuthFormState = {};

function Feedback({ state }: { state: AuthFormState }) {
  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon aria-hidden />
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }
  if (state.success) {
    return (
      <Alert>
        <CircleCheckIcon aria-hidden />
        <AlertDescription>{state.success}</AlertDescription>
      </Alert>
    );
  }
  return null;
}

export function BuildingsManager({
  buildings,
  apartments,
}: {
  buildings: Building[];
  apartments: ApartmentWithBuilding[];
}) {
  const t = useT();
  const [buildingState, addBuilding, buildingPending] = useActionState(
    createBuildingAction,
    initial,
  );
  const [flatState, addFlat, flatPending] = useActionState(
    createApartmentAction,
    initial,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("buildings.addBuilding")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addBuilding} className="space-y-3">
            <Feedback state={buildingState} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("buildings.name")}</Label>
                <Input id="name" name="name" required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("buildings.address")}</Label>
                <Input id="address" name="address" maxLength={240} />
              </div>
            </div>
            <Button type="submit" disabled={buildingPending}>
              {buildingPending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
              {t("buildings.addBuilding")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {buildings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("buildings.addFlat")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addFlat} className="space-y-3">
              <Feedback state={flatState} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="building_id">{t("buildings.building")}</Label>
                  <select
                    id="building_id"
                    name="building_id"
                    required
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">{t("buildings.flatLabel")}</Label>
                  <Input id="label" name="label" required maxLength={40} placeholder="A-101" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">{t("buildings.floor")}</Label>
                  <Input id="floor" name="floor" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_rent">{t("buildings.rent")}</Label>
                  <Input id="base_rent" name="base_rent" type="number" min={0} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="security_deposit">{t("buildings.deposit")}</Label>
                  <Input id="security_deposit" name="security_deposit" type="number" min={0} defaultValue={0} />
                </div>
              </div>
              <Button type="submit" disabled={flatPending}>
                {flatPending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
                {t("buildings.addFlat")}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {buildings.map((building) => {
          const flats = apartments.filter((a) => a.building_id === building.id);
          return (
            <Card key={building.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Building2Icon className="size-4 text-primary" aria-hidden />
                  {building.name}
                </CardTitle>
                <form action={deleteBuildingAction}>
                  <input type="hidden" name="id" value={building.id} />
                  <Button type="submit" variant="ghost" size="icon" aria-label="Delete building">
                    <Trash2Icon aria-hidden />
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="space-y-2">
                {building.address ? (
                  <p className="text-sm text-muted-foreground">{building.address}</p>
                ) : null}
                {flats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("buildings.noFlats")}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {flats.map((flat) => (
                      <li key={flat.id} className="flex items-center justify-between gap-3 py-2">
                        <div>
                          <span className="font-medium">{flat.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {flat.status === "occupied" ? t("buildings.occupied") : t("buildings.vacant")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Money value={flat.base_rent} className="text-sm" />
                          <form action={deleteApartmentAction}>
                            <input type="hidden" name="id" value={flat.id} />
                            <Button type="submit" variant="ghost" size="icon" aria-label="Delete flat">
                              <Trash2Icon aria-hidden />
                            </Button>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
