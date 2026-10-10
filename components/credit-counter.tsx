import { creditsLeftLabel, isLow, meterFill } from "@/lib/credits-meter";
import { cn } from "@/lib/utils";

type Props = {
  remaining: number;
  onOpen: () => void;
  className?: string;
};

/** The credits pill shown top-right on every screen; opens the credits sheet. */
export function CreditCounter({ remaining, onOpen, className }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${creditsLeftLabel(remaining)}. Open credits and history`}
      className={cn(
        "flex h-11 items-center gap-2 rounded-full bg-card px-3.5 text-foreground shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
        className,
      )}
    >
      <span className="flex h-1.5 w-10 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span
          className={cn("h-full", isLow(remaining) ? "bg-destructive" : "bg-primary")}
          style={{ width: `${meterFill(remaining)}%` }}
        />
      </span>
      <span className="type-numeric" aria-hidden>
        {remaining}
      </span>
    </button>
  );
}
