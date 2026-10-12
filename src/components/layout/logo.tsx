import { cn } from "@/lib/utils";

/**
 * Rentless mark: a rounded tile whose roofline sits above a rupee glyph.
 * Uses theme tokens so it adapts to light and dark automatically.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Rentless"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="48" height="48" rx="13" fill="var(--primary)" />
      <g
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15.5 18.5 24 11.5l8.5 7" />
        <path d="M19 24.5h10" />
        <path d="M19 29.5h8.5" />
        <path d="M19.5 23.5v15" />
        <path d="M25 29.5 31 38" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      {showWordmark ? (
        <span className="text-lg font-semibold tracking-tight">
          Rentless
          <span className="text-accent">.</span>
        </span>
      ) : null}
    </span>
  );
}
