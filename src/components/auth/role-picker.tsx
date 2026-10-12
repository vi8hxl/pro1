"use client";

import { Building2Icon, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";

export function RolePicker({ defaultRole = "owner" }: { defaultRole?: "owner" | "tenant" }) {
  const t = useT();

  const options = [
    {
      value: "owner" as const,
      icon: Building2Icon,
      label: t("auth.roleOwner"),
      hint: t("auth.roleOwnerHint"),
    },
    {
      value: "tenant" as const,
      icon: HomeIcon,
      label: t("auth.roleTenant"),
      hint: t("auth.roleTenantHint"),
    },
  ];

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">{t("auth.chooseRole")}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-xl border border-border p-4 transition-colors",
                "hover:bg-muted/60",
                "has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-2 has-[:checked]:ring-primary/30",
              )}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                defaultChecked={defaultRole === option.value}
                required
                className="sr-only"
              />
              <span className="flex items-center gap-2 font-medium">
                <Icon className="size-4 text-primary" aria-hidden />
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground">{option.hint}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
