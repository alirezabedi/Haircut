import { cn } from "@/lib/utils";

/** Phone-width screen frame: 16px gutters, 24px top and 32px bottom padding (plus safe areas). */
export function Screen({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4",
        "pt-[calc(24px+env(safe-area-inset-top))] pb-[calc(32px+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </main>
  );
}
