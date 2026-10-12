"use client";

import { useTheme } from "next-themes";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/lib/i18n/provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useT();

  const options = [
    { value: "light", label: t("common.themeLight"), icon: SunIcon },
    { value: "dark", label: t("common.themeDark"), icon: MoonIcon },
    { value: "system", label: t("common.themeSystem"), icon: MonitorIcon },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("common.theme")}>
          {/* CSS-driven so there is no mount/hydration race. */}
          <SunIcon className="dark:hidden" aria-hidden />
          <MoonIcon className="hidden dark:block" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              data-active={theme === option.value ? "true" : undefined}
              className="data-[active=true]:bg-accent/15"
            >
              <Icon aria-hidden />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
