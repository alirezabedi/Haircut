import { cn } from "@/lib/utils";

export const LOW_CREDITS = 10;

type Props = {
  remaining: number;
  total: number;
  onOpen: () => void;
  className?: string;
};

/** The credits pill shown top-right on every screen; opens the credits sheet. */
export function CreditCounter({ remaining, total, onOpen, className }: Props) {
  const low = remaining <= LOW_CREDITS;
  const fill = Math.min(100, Math.max(0, (remaining / total) * 100));

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${remaining} of ${total} credits left. Open credits and history`}
      className={cn(
        "flex h-11 items-center gap-2 rounded-full bg-card px-3.5 text-foreground shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
        className,
      )}
    >
      <span className="flex h-1.5 w-10 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span
          className={cn("h-full", low ? "bg-destructive" : "bg-primary")}
          style={{ width: `${fill}%` }}
        />
      </span>
      <span className="type-numeric" aria-hidden>
        {remaining}
        <span className="text-muted-foreground">/{total}</span>
      </span>
    </button>
  );
}
